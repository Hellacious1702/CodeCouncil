const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    console.log("Listing available models...");
    const result = await genAI.models.list();
    for (const m of result.models) {
        console.log(`- ${m.name} (${m.supportedMethods.join(', ')})`);
    }
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

listModels();
