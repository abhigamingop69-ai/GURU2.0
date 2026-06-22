import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for generating quiz
  app.post("/api/generate-quiz", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }

      const { chapterTitle, weakAreas } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Create a custom 3-question multiple choice practice quiz for a student learning about "${chapterTitle}". They specifically want to focus on their weak areas: ${weakAreas || 'general concepts'}.
      
      Generate unique questions. For each question provide:
      1. the question text
      2. exactly 4 options
      3. the index (0-3) of the correct option
      4. a short explanation of why the answer is correct
      
      Do not include formatting outside the requested JSON schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of multiple choice questions",
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswerIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ["question", "options", "correctAnswerIndex", "explanation"],
            },
          },
        },
      });

      const quizData = JSON.parse(response.text || "[]");
      res.json(quizData);
    } catch (error: any) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate quiz" });
    }
  });

  // API route for generating flashcards
  app.post("/api/generate-flashcards", async (req, res) => {
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY environment variable is missing.");
      }

      const { chapterTitle, count = 5 } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Create exactly ${count} unique standard flashcards for a high school student learning about "${chapterTitle}". 
      Each flashcard should test an important concept or fact from this topic.
      Do not repeat previous flashcards if possible.
      
      For each flashcard provide:
      1. the front (question or term)
      2. the back (answer or definition)
      
      Do not include formatting outside the requested JSON schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of flashcards",
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING },
              },
              required: ["front", "back"],
            },
          },
        },
      });

      const flashcardsData = JSON.parse(response.text || "[]");
      res.json(flashcardsData);
    } catch (error: any) {
      console.error("Flashcards generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate flashcards" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
