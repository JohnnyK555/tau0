import { GoogleGenAI, Type } from "@google/genai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // ZKUS TADY PŘEPSAT NÁZEV

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

export async function generateQuestions(subject: 'cesky_jazyk' | 'matematika', count: number = 5, topic?: string): Promise<Question[]> {
  const subjectName = subject === 'cesky_jazyk' ? 'Český jazyk' : 'Matematika';
  let prompt = `Vygeneruj ${count} typických testových otázek z předmětu ${subjectName} pro přípravu na jednotné přijímací zkoušky na střední školy v ČR (9. třída, formát Cermat).`;
  
  if (topic) {
    prompt += `\nZaměř se specificky na téma: ${topic}.`;
  } else {
    prompt += `\nOtázky by měly být různorodé (např. u češtiny: pravopis, skladba, porozumění textu, literatura; u matematiky: zlomky, rovnice, geometrie, slovní úlohy).`;
  }

  prompt += `\nU uzavřených otázek (multiple_choice) uveď 4 možnosti (A, B, C, D). U otevřených otázek (open_ended) nech pole options prázdné. Odpověď musí být přesná hodnota nebo text správné možnosti.`;

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
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
  try {
    const data = JSON.parse(jsonStr);
    return data.map((q: any, index: number) => ({
      ...q,
      id: Math.random().toString(36).substring(7) + index,
      subject,
      topic
    }));
  } catch (e) {
    console.error("Failed to parse questions", e);
    return [];
  }
}

export async function generateExam(subject: 'cesky_jazyk' | 'matematika'): Promise<Question[]> {
  // Generujeme menší počet otázek pro ukázku, reálný test má např. 30 úloh, ale to by trvalo dlouho vygenerovat najednou.
  // Pro účely aplikace vygenerujeme 10 různorodých otázek.
  return generateQuestions(subject, 10);
}

