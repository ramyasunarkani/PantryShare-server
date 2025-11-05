const main = require("../config/gemini");

exports.getChatbotReply = async (req, res) => {
  const { message } = req.body;

  try {
    const prompt = [
      "You are PantryBot, a friendly assistant for PantryShare.",
      message,
    ];

    const reply = await main(prompt);
    res.json({ reply });
  } catch (error) {
    console.error("Error in chatbot controller:", error);
    res
      .status(500)
      .json({ reply: "Sorry 😅 I couldn’t process that right now." });
  }
};
