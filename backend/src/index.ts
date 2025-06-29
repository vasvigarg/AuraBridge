require("dotenv").config();
import express from "express";
import { GoogleGenAI } from "@google/genai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import cors from "cors";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
const app = express();
app.use(cors());
app.use(express.json());

app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction:
          "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
        temperature: 0.1,
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster response
        },
      },
    });

    const answer = response.text?.trim().toLowerCase() || ""; // react or node

    if (answer === "react") {
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    }

    if (answer === "node") {
      res.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
      return;
    }

    res.status(403).json({ message: "You cant access this" });
    return;
  } catch (error) {
    console.error("Error in /template:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

// Helper function to convert Anthropic message format to Gemini format
function convertMessagesToGeminiFormat(messages: any[]) {
  const geminiHistory = [];

  for (const message of messages) {
    if (message.role === "user") {
      geminiHistory.push({
        role: "user",
        parts: [{ text: message.content }],
      });
    } else if (message.role === "assistant") {
      geminiHistory.push({
        role: "model",
        parts: [{ text: message.content }],
      });
    }
  }

  return geminiHistory;
}

app.post("/chat", async (req, res) => {
  const messages = req.body.messages;

  try {
    // Convert messages to Gemini format
    const geminiMessages = convertMessagesToGeminiFormat(messages);

    if (geminiMessages.length === 0) {
      res.status(400).json({ message: "No valid messages provided" });
      return;
    }

    // Get the last message (current user input)
    const lastMessage = geminiMessages[geminiMessages.length - 1];
    const conversationHistory = geminiMessages.slice(0, -1);

    // Create chat with conversation history
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: conversationHistory,
      config: {
        systemInstruction: getSystemPrompt(),
        temperature: 0.7,
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster response
        },
      },
    });

    // Send the current message
    const response = await chat.sendMessage({
      message: lastMessage.parts[0].text,
    });

    console.log(response);

    res.json({
      response: response.text || "",
    });
  } catch (error) {
    console.error("Error in /chat:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
});

// New endpoint for streaming chat responses
app.post("/chat/stream", async (req, res) => {
  const messages = req.body.messages;

  try {
    // Set headers for Server-Sent Events
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    });

    // Convert messages to Gemini format
    const geminiMessages = convertMessagesToGeminiFormat(messages);

    if (geminiMessages.length === 0) {
      res.write(
        `data: ${JSON.stringify({ error: "No valid messages provided" })}\n\n`
      );
      res.end();
      return;
    }

    // Get the last message (current user input)
    const lastMessage = geminiMessages[geminiMessages.length - 1];
    const conversationHistory = geminiMessages.slice(0, -1);

    // Create chat with conversation history
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: conversationHistory,
      config: {
        systemInstruction: getSystemPrompt(),
        temperature: 0.7,
        thinkingConfig: {
          thinkingBudget: 0, // Disable thinking for faster response
        },
      },
    });

    // Send the current message with streaming
    const stream = await chat.sendMessageStream({
      message: lastMessage.parts[0].text,
    });

    // Stream the response
    for await (const chunk of stream) {
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
      }
    }

    // End the stream
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    console.error("Error in /chat/stream:", error);
    res.write(
      `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`
    );
    res.end();
    return;
  }
});

// New endpoint for simple text generation (non-chat)
app.post("/generate", async (req, res) => {
  const { prompt, stream = false } = req.body;

  try {
    if (stream) {
      // Set headers for Server-Sent Events
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      });

      const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });

      for await (const chunk of response) {
        const chunkText = chunk.text;
        if (chunkText) {
          res.write(`data: ${JSON.stringify({ content: chunkText })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } else {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          thinkingConfig: {
            thinkingBudget: 0,
          },
        },
      });

      res.json({
        response: response.text || "",
      });
    }
  } catch (error) {
    console.error("Error in /generate:", error);
    if (stream) {
      res.write(
        `data: ${JSON.stringify({ error: "Internal server error" })}\n\n`
      );
      res.end();
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
    return;
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
