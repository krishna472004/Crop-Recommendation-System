import crypto from "crypto";

const useMemoryDb = !process.env.MONGODB_URI;

const memory = {
  plantations: [],
  reports: [],
  logs: []
};

function nowIso() {
  return new Date().toISOString();
}

function withId(record) {
  const id = record._id || crypto.randomUUID();
  return {
    ...record,
    _id: id,
    id
  };
}

export function isMemoryDbEnabled() {
  return useMemoryDb;
}

export async function upsertPlantation(record) {
  if (!useMemoryDb) {
    return null;
  }

  const keyEmail = record.email.toLowerCase();
  const keyLocation = record.locationName.trim().toLowerCase();
  const existingIndex = memory.plantations.findIndex(
    (item) => item.email === keyEmail && item.locationName.toLowerCase() === keyLocation
  );

  const timestamp = nowIso();
  const nextRecord = withId({
    ...(existingIndex >= 0 ? memory.plantations[existingIndex] : {}),
    ...record,
    email: keyEmail,
    isActive: true,
    updatedAt: timestamp,
    createdAt: existingIndex >= 0 ? memory.plantations[existingIndex].createdAt : timestamp
  });

  if (existingIndex >= 0) {
    memory.plantations[existingIndex] = nextRecord;
  } else {
    memory.plantations.push(nextRecord);
  }

  return nextRecord;
}

export async function findPlantationById(id) {
  if (!useMemoryDb) {
    return null;
  }

  return memory.plantations.find((item) => item._id === id || item.id === id) || null;
}

export async function findPlantationByEmailAndLocation(email, locationName) {
  if (!useMemoryDb) {
    return null;
  }

  const targetEmail = email.toLowerCase();
  const targetLocation = locationName.trim().toLowerCase();

  return memory.plantations.find(
    (item) => item.email === targetEmail && item.locationName.toLowerCase() === targetLocation
  ) || null;
}

export async function findActivePlantations() {
  if (!useMemoryDb) {
    return [];
  }

  return memory.plantations.filter((item) => item.isActive !== false);
}

export async function findReportByPlantationAndKey(plantationId, reportKey) {
  if (!useMemoryDb) {
    return null;
  }

  return memory.reports.find(
    (item) => item.plantationId === plantationId && item.reportKey === reportKey
  ) || null;
}

export async function findLatestReportByPlantation(plantationId) {
  if (!useMemoryDb) {
    return null;
  }

  return [...memory.reports]
    .filter((item) => item.plantationId === plantationId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
}

export async function createReport(record) {
  if (!useMemoryDb) {
    return null;
  }

  const timestamp = nowIso();
  const nextRecord = withId({
    ...record,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  memory.reports.push(nextRecord);
  return nextRecord;
}

export async function updateReport(id, updates) {
  if (!useMemoryDb) {
    return null;
  }

  const index = memory.reports.findIndex((item) => item._id === id || item.id === id);

  if (index === -1) {
    return null;
  }

  memory.reports[index] = {
    ...memory.reports[index],
    ...updates,
    updatedAt: nowIso()
  };

  return memory.reports[index];
}

export async function findReportsByPlantation(plantationId, limit = 60) {
  if (!useMemoryDb) {
    return [];
  }

  return [...memory.reports]
    .filter((item) => item.plantationId === plantationId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

export async function createLog(record) {
  if (!useMemoryDb) {
    return null;
  }

  const timestamp = nowIso();
  const nextRecord = withId({
    ...record,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  memory.logs.push(nextRecord);
  return nextRecord;
}

export async function findLogsByPlantation(plantationId, limit = 100) {
  if (!useMemoryDb) {
    return [];
  }

  return [...memory.logs]
    .filter((item) => item.plantationId === plantationId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}
