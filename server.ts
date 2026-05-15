import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini analysis
  app.post("/api/analyze", async (req, res) => {
    const { query, lang } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const langName = {
      fr: 'français',
      en: 'English',
      es: 'español'
    }[lang as 'fr'|'en'|'es'] || 'français';

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [{ text: `Est-ce que "${query}" est plutôt hétérosexuel ou homosexuel ? Réponds en ${langName}.` }]
          }
        ],
        config: {
          systemInstruction: "Tu es une IA humoristique et décontractée. On te donne un mot ou un concept, et tu dois décider de manière absurde et drôle s'il est plutôt 'Hétérosexuelle' ou 'Homosexuelle' — selon des critères totalement farfelus, des clichés amusants, des références pop culture, etc. Le but est d'être léger, absurde et drôle, jamais blessant. IMPORTANT : tu dois être vraiment équilibré dans tes réponses, environ 47% 'Hétérosexuelle', 47% 'Homosexuelle', et 6% 'Aucun des deux'. Pour chaque concept, explore activement les deux possibilités avant de trancher, et choisis celle qui donne l'explication la plus drôle. Réponds dans la langue de l'utilisateur.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verdict: {
                type: Type.STRING,
                description: "Le verdict: 'Hétérosexuelle', 'Homosexuelle' ou 'Aucun des deux'",
                enum: ["Hétérosexuelle", "Homosexuelle", "Aucun des deux"]
              },
              explication: {
                type: Type.STRING,
                description: "Une explication courte, drôle et absurde de 1 à 3 phrases."
              }
            },
            required: ["verdict", "explication"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error) {
      console.error("Gemini Error:", error);
      res.status(500).json({ error: "Erreur lors de l'analyse par l'IA." });
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
    // For Express v4, use '*'
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
