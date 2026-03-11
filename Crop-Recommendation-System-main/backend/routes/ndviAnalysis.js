import express from "express";

const router = express.Router();

router.post("/ndvi-analysis", async (req, res) => {

  const { prompt } = req.body;

  try {

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.5
        })
      }
    );

    const data = await response.json();

    console.log("Groq NDVI response:", data);

    const result =
      data?.choices?.[0]?.message?.content ||
      "AI analysis could not be generated.";

    res.json({ result });

  } catch (error) {

    console.error("NDVI AI Error:", error);
    res.status(500).json({ result: "Failed to generate analysis." });

  }

});

export default router;