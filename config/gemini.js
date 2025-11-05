const { GoogleGenerativeAI } = require("@google/generative-ai");

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main(prompt) {
  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const instruction = "Give short, simple, and friendly answers.";
    const fullPrompt = `${instruction}\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);

    const reply =
      result?.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry 😅, I couldn't get a valid response.";

    return reply;
  } catch (error) {
    console.error("Gemini API error:", error.message);
    throw new Error("Gemini API failed");
  }
}

module.exports = main;
