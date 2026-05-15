import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'v1-app',
    }
  }
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
    res.status(200).json(result);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Erreur lors de l'analyse par l'IA." });
  }
}
