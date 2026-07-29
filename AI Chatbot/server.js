import express from "express";
import cors from "cors";
import { OpenRouter } from "@openrouter/sdk";

const app = express();
app.use(express.json());
app.use(cors()); // Allows your frontend to talk to this server

// Initialize OpenRouter
const openrouter = new OpenRouter({
  apiKey: "###KEY IS IN THE DOCS###"
});

// Endpoint that your frontend will send messages to
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  try {
    const stream = await openrouter.chat.send({
      chatRequest: {
        model: "inclusionai/ling-3.0-flash:free",
        messages: messages,
        stream: false // For a simple web endpoint, turning off streaming makes it easier to return JSON back
      }
    });

    const reply = stream.choices[0]?.message?.content || "No response";
    res.json({ reply });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to fetch response from AI" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
