import axios from "axios";
import dotenv from "dotenv";
import Plantation from "../models/Plantation.js";
import NDVIReport from "../models/NDVIReport.js";
import MonitoringLog from "../models/MonitoringLog.js";
import {
  createLog,
  createReport,
  findActivePlantations,
  findLatestReportByPlantation,
  findLogsByPlantation,
  findReportByPlantationAndKey,
  findReportsByPlantation,
  isMemoryDbEnabled,
  updateReport
} from "../database/runtimeStore.js";
import { sendNDVIReportEmail } from "./emailService.js";

dotenv.config();

const isMinuteTestMode = process.env.NDVI_TEST_MODE !== "false";

function getStatusLabel(value) {
  if (value <= 0.2) return "Bare";
  if (value <= 0.4) return "Sparse";
  if (value <= 0.6) return "Moderate";
  if (value <= 0.8) return "Healthy";
  return "Dense";
}

function getTrend(currentValue, previousValue) {
  if (previousValue == null) {
    return "Stable";
  }

  const delta = Number((currentValue - previousValue).toFixed(3));

  if (delta >= 0.05) return "Improving";
  if (delta <= -0.05) return "Declining";
  if (currentValue > previousValue) return "Recovering";
  return "Stable";
}

function getReportWindow(now = new Date()) {
  const reportDate = now.toISOString().slice(0, 10);
  const reportKey = isMinuteTestMode
    ? now.toISOString().slice(0, 16)
    : reportDate;

  return { reportDate, reportKey };
}

function buildSummary({ plantation, ndviValue, status, trend }) {
  return `${plantation.name} at ${plantation.locationName} recorded an NDVI value of ${ndviValue.toFixed(3)}, which indicates ${status.toLowerCase()} vegetation conditions. The current trend is ${trend.toLowerCase()}, so irrigation timing, field scouting, and canopy checks should continue without interruption.`;
}

async function addMonitoringLog(plantationId, level, message, context = {}) {
  try {
    if (isMemoryDbEnabled()) {
      await createLog({ plantationId, level, message, context });
    } else {
      await MonitoringLog.create({
        plantationId,
        level,
        message,
        context
      });
    }
  } catch (error) {
    console.error("Monitoring log write failed:", error.message);
  }
}

async function getAccessToken() {
  const clientId = process.env.SENTINEL_CLIENT_ID;
  const clientSecret = process.env.SENTINEL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const res = await axios.post(
    "https://services.sentinel-hub.com/oauth/token",
    `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  );

  return res.data.access_token;
}

async function tryFetchSentinelNDVI(plantation, token) {
  if (!token) {
    return null;
  }

  try {
    const buffer = 0.0008;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const response = await axios.post(
      "https://services.sentinel-hub.com/api/v1/statistics",
      {
        bounds: {
          bbox: [
            plantation.longitude - buffer,
            plantation.latitude - buffer,
            plantation.longitude + buffer,
            plantation.latitude + buffer
          ]
        },
        input: {
          bounds: {
            properties: {
              crs: "http://www.opengis.net/def/crs/EPSG/0/4326"
            }
          },
          data: [{ type: "sentinel-2-l2a" }]
        },
        aggregation: {
          timeRange: {
            from: startDate.toISOString(),
            to: endDate.toISOString()
          },
          aggregationInterval: {
            of: "P7D"
          },
          resx: 10,
          resy: 10,
          evalscript: `
          //VERSION=3
          function setup() {
            return {
              input: ["B04", "B08"],
              output: { bands: 1, sampleType: "FLOAT32" }
            };
          }
          function evaluatePixel(sample) {
            return [(sample.B08 - sample.B04) / (sample.B08 + sample.B04)];
          }
        `
        }
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const mean = response.data?.data?.[0]?.outputs?.default?.bands?.B0?.stats?.mean;

    if (typeof mean !== "number" || Number.isNaN(mean)) {
      return null;
    }

    return Number(Math.min(0.92, Math.max(0, mean)).toFixed(3));
  } catch (error) {
    console.warn(`Sentinel NDVI fetch failed for ${plantation.name}:`, error.message);
    return null;
  }
}

function generateSimulatedNDVI(plantation) {
  const seasonalBias = new Date().getMonth() >= 5 && new Date().getMonth() <= 9 ? 0.08 : 0;
  const geoBias = Math.abs((plantation.latitude + plantation.longitude) % 0.12);
  const value = 0.45 + seasonalBias + geoBias + Math.random() * 0.18;

  return Number(Math.min(0.92, Math.max(0.18, value)).toFixed(3));
}

export async function createDailyNDVIReport(plantation, options = {}) {
  const now = new Date();
  const { reportDate, reportKey } = getReportWindow(now);

  if (!options.forceNew) {
    const existing = isMemoryDbEnabled()
      ? await findReportByPlantationAndKey(plantation._id, reportKey)
      : await NDVIReport.findOne({
          plantationId: plantation._id,
          reportKey
        });

    if (existing) {
      return existing;
    }
  }

  await addMonitoringLog(
    plantation._id,
    "info",
    `NDVI monitoring run started for ${plantation.name}`,
    { reportKey, mode: isMinuteTestMode ? "minute-test" : "daily" }
  );

  const previousReport = isMemoryDbEnabled()
    ? await findLatestReportByPlantation(plantation._id)
    : await NDVIReport.findOne({
        plantationId: plantation._id
      }).sort({ createdAt: -1 });

  const token = await getAccessToken().catch(() => null);
  const sentinelValue = await tryFetchSentinelNDVI(plantation, token);
  const ndviValue = sentinelValue ?? generateSimulatedNDVI(plantation);
  const status = getStatusLabel(ndviValue);
  const trend = getTrend(ndviValue, previousReport?.ndviValue);
  const summary = buildSummary({ plantation, ndviValue, status, trend });

  const reportPayload = {
    plantationId: plantation._id,
    reportDate,
    reportKey,
    ndviValue,
    status,
    trend,
    summary,
    source: sentinelValue == null ? "simulated" : "sentinel",
    emailSentAt: null
  };

  const report = isMemoryDbEnabled()
    ? await createReport(reportPayload)
    : await NDVIReport.create(reportPayload);

  await addMonitoringLog(
    plantation._id,
    "success",
    `NDVI report generated with value ${ndviValue.toFixed(3)}`,
    { status, trend, source: report.source, reportKey }
  );

  const emailSent = await sendNDVIReportEmail({
    to: plantation.email,
    plantationName: plantation.name,
    locationName: plantation.locationName,
    report
  }).catch(() => false);

  if (emailSent) {
    if (isMemoryDbEnabled()) {
      await updateReport(report._id, { emailSentAt: new Date().toISOString() });
      report.emailSentAt = new Date().toISOString();
    } else {
      report.emailSentAt = new Date();
      await report.save();
    }
    await addMonitoringLog(
      plantation._id,
      "success",
      `Email report sent to ${plantation.email}`,
      { reportKey }
    );
  } else {
    await addMonitoringLog(
      plantation._id,
      "warning",
      "Email report not sent. SMTP not configured or delivery failed.",
      { reportKey }
    );
  }

  return report;
}

export async function fetchNDVIForAllPlantations() {
  const plantations = isMemoryDbEnabled()
    ? await findActivePlantations()
    : await Plantation.find({ isActive: true });
  const reports = [];

  for (const plantation of plantations) {
    try {
      const report = await createDailyNDVIReport(plantation);
      reports.push(report);
    } catch (error) {
      await addMonitoringLog(
        plantation._id,
        "error",
        `NDVI scheduler failed for ${plantation.name}`,
        { error: error.message }
      );
    }
  }

  return reports;
}

export async function getMonitoringLogs(plantationId, limit = 50) {
  const logs = isMemoryDbEnabled()
    ? await findLogsByPlantation(plantationId, limit)
    : await MonitoringLog.find({ plantationId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

  return logs.map((log) => ({
    id: log._id,
    level: log.level,
    message: log.message,
    context: log.context,
    createdAt: log.createdAt
  }));
}

export async function getPlantationHealthSummary(plantationId) {
  const reports = isMemoryDbEnabled()
    ? await findReportsByPlantation(plantationId, 60)
    : await NDVIReport.find({ plantationId })
        .sort({ createdAt: -1 })
        .limit(60)
        .lean();

  if (!reports.length) {
    return null;
  }

  const latest30 = [...reports.slice(0, 28)].reverse();
  const weeklyGroups = [[], [], [], []];

  latest30.forEach((report, index) => {
    const weekIndex = Math.min(3, Math.floor(index / 7));
    weeklyGroups[weekIndex].push(report.ndviValue);
  });

  const average = (values) =>
    values.length
      ? Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(3))
      : 0;

  const week1 = average(weeklyGroups[0]);
  const week2 = average(weeklyGroups[1]);
  const week3 = average(weeklyGroups[2]);
  const week4 = average(weeklyGroups[3]);

  const validWeeks = [week1, week2, week3, week4].filter((value) => value > 0);
  const totalAvg = validWeeks.length
    ? Number((validWeeks.reduce((sum, value) => sum + value, 0) / validWeeks.length).toFixed(3))
    : 0;

  const logs = await getMonitoringLogs(plantationId, 80);

  return {
    week1,
    week2,
    week3,
    week4,
    plantationHealth: `${(totalAvg * 100).toFixed(2)}%`,
    reports: reports.map((report) => ({
      id: report._id,
      reportDate: report.reportDate,
      reportKey: report.reportKey,
      ndviValue: report.ndviValue,
      status: report.status,
      trend: report.trend,
      summary: report.summary,
      source: report.source,
      emailSentAt: report.emailSentAt,
      createdAt: report.createdAt
    })),
    logs
  };
}
