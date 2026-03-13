import { GoogleGenAI, Type } from "@google/genai";

// V AI Studiu používáme process.env.GEMINI_API_KEY. 
// Pro produkční nasazení (Netlify/Vercel) se doporučuje VITE_GEMINI_API_KEY.
const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export interface Question {
  id: string;
  subject: 'cesky_jazyk' | 'matematika';
  topic?: string;
  text: string;
  type: 'multiple_choice' | 'open_ended';
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export async function generateQuestions(subject: 'cesky_jazyk' | 'matematika', count: number = 3, topic?: string): Promise<Question[]> {
  const subjectName = subject === 'cesky_jazyk' ? 'Český jazyk' : 'Matematika';
  let prompt = `Vygeneruj ${count} typických testových otázek z předmětu ${subjectName} pro přípravu na jednotné přijímací zkoušky na střední školy v ČR (9. třída, formát Cermat).`;
  
  if (topic) {
    prompt += `\nZaměř se specificky na téma: ${topic}.`;
  } else {
    prompt += `\nOtázky by měly být různorodé (např. u češtiny: pravopis, skladba, porozumění textu, literatura; u matematiky: zlomky, rovnice, geometrie, slovní úlohy).`;
  }

  prompt += `\nU uzavřených otázek (multiple_choice) uveď 4 možnosti (A, B, C, D). U otevřených otázek (open_ended) nech pole options prázdné. Odpověď musí být přesná hodnota nebo text správné možnosti.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Přepnuto na Flash pro vyšší limity (15 RPM)
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "Text otázky. Může obsahovat i výchozí text nebo zadání."
              },
              type: {
                type: Type.STRING,
                description: "Typ otázky: 'multiple_choice' nebo 'open_ended'"
              },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                },
                description: "Možnosti odpovědí pro multiple_choice, jinak prázdné pole."
              },
              correctAnswer: {
                type: Type.STRING,
                description: "Správná odpověď (přesný text z možností nebo konkrétní hodnota/výsledek)."
              },
              explanation: {
                type: Type.STRING,
                description: "Vysvětlení správného řešení a postupu."
              }
            },
            required: ["text", "type", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const jsonStr = response.text?.trim() || "[]";
    const data = JSON.parse(jsonStr);
    return data.map((q: any, index: number) => ({
      ...q,
      id: Math.random().toString(36).substring(7) + index,
      subject,
      topic
    }));
  } catch (e: any) {
    if (e?.message?.includes('429')) {
      throw new Error('Limit požadavků vyčerpán (429). Počkejte prosím minutu a zkuste to znovu.');
    }
    console.error("Failed to generate questions", e);
    throw e;
  }
}

export async function generateExam(subject: 'cesky_jazyk' | 'matematika'): Promise<Question[]> {
  const subjectName = subject === 'cesky_jazyk' ? 'Český jazyk' : 'Matematika';
  const count = 25; // Plnohodnotná zkouška
  
  let prompt = `Vygeneruj KOMPLETNÍ test ${count} otázek z předmětu ${subjectName} pro přípravu na jednotné přijímací zkoušky na střední školy v ČR (9. třída, formát Cermat).
  
  Test musí obsahovat:
  - Různorodá témata odpovídající osnovám (u ČJ: pravopis, skladba, porozumění textu, literární druhy; u M: zlomky, rovnice, slovní úlohy, geometrie).
  - Mix uzavřených (multiple_choice) a otevřených (open_ended) úloh.
  - U matematiky zahrň alespoň 3 úlohy zaměřené na konstrukční geometrii (rýsování), kde popíšeš zadání pro narýsování (např. narýsujte trojúhelník, kružnici opsanou, atd.).
  - Každá otázka musí mít podrobné vysvětlení postupu řešení.
  
  U uzavřených otázek uveď 4 možnosti (A, B, C, D). Odpověď musí být přesná hodnota nebo text správné možnosti.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "Text otázky. Může obsahovat i výchozí text nebo zadání."
              },
              type: {
                type: Type.STRING,
                description: "Typ otázky: 'multiple_choice' nebo 'open_ended'"
              },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                },
                description: "Možnosti odpovědí pro multiple_choice, jinak prázdné pole."
              },
              correctAnswer: {
                type: Type.STRING,
                description: "Správná odpověď (přesný text z možností nebo konkrétní hodnota/výsledek)."
              },
              explanation: {
                type: Type.STRING,
                description: "Vysvětlení správného řešení a postupu."
              }
            },
            required: ["text", "type", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const jsonStr = response.text?.trim() || "[]";
    const data = JSON.parse(jsonStr);
    return data.map((q: any, index: number) => ({
      ...q,
      id: Math.random().toString(36).substring(7) + index,
      subject
    }));
  } catch (e: any) {
    console.error("Failed to generate exam", e);
    return [];
  }
}


