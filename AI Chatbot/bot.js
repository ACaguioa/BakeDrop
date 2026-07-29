import { OpenRouter } from "@openrouter/sdk";
import readline from "readline";

// Initialize OpenRouter with your API key
const openrouter = new OpenRouter({
  apiKey: "###KEY in the docs###"
});

// Set up command line interface for interactive chat
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Maintain conversation history
const messages = [
  { role: "system", content: "You are a helpful and friendly AI assistant." }
];

async function askQuestion() {
  rl.question("\nYou: ", async (userInput) => {
    // Exit condition
    if (userInput.toLowerCase() === "exit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    // Add user message to history
    messages.push({ role: "user", content: userInput });

    process.stdout.write("Bot: ");

    try {
      // Stream the response from OpenRouter
      const stream = await openrouter.chat.send({
        chatRequest: {
          model: "inclusionai/ling-3.0-flash:free",
          messages: messages,
          stream: true
        }
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          fullResponse += content;
          process.stdout.write(content);
        }

        // Optional: Check for reasoning tokens in the final chunk
        if (chunk.usage && chunk.usage.completionTokensDetails?.reasoningTokens) {
          console.log(`\n[Reasoning tokens used: ${chunk.usage.completionTokensDetails.reasoningTokens}]`);
        }
      }

      // Add assistant response to history
      messages.push({ role: "assistant", content: fullResponse });
      console.log(); // New line after stream finishes
    } catch (error) {
      console.error("\nError communicating with OpenRouter:", error.message);
    }

    // Continue the conversation loop
    askQuestion();
  });
}

console.log("=== OpenRouter Chatbot Initialized ===");
console.log("Type your message below and press Enter. Type 'exit' to quit.\n");
askQuestion();
