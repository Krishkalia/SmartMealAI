require('dotenv').config({ path: './backend/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

async function test() {
  try {
    const prompt = `
        Return exactly 10 very basic pantry staples that almost every household has (e.g., salt, pepper, oil, rice).
        Return strictly in this JSON format without markdown ticks, as an array of objects:
        [
          { "name": "Ingredient Name", "qty": 1, "unit": "kg" }
        ]
        Use metric units (kg, g, L, ml) or 'pcs' or 'bottle'. Do not use cups or spoons.
      `;
      
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    console.log("Raw output:");
    console.log(text);
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    console.log("Parsed:", JSON.parse(text));
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
