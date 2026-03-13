import { GoogleGenAI } from "@google/genai";

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
  console.log("🚀 FUNKCE GENERATE SE SPUSTILA!"); 
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("🔑 API klíč v aplikaci:", apiKey ? "MÁM HO (začíná na " + apiKey.substring(0, 5) + "...)" : "PRÁZDNÝ");
  
  if (!apiKey) {
    alert("CHYBA: Aplikace nemá API klíč! Zkontroluj Netlify.");
    return [];
  }

  const genAI = new GoogleGenAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const subjectName = subject === 'cesky_jazyk' ? 'Český jazyk' : 'Matematika';
  let prompt = `Vygeneruj ${count} typických testových otázek z předmětu ${subjectName} pro přípravu na jednotné přijímací zkoušky na střední školy v ČR (9. třída, formát Cermat).
  
  U uzavřených otázek (multiple_choice) uveď 4 možnosti (A, B, C, D). U otevřených otázek (open_ended) nech pole options prázdné. Odpověď musí být přesná hodnota nebo text správné možnosti.
  
  Vrať POUZE čisté pole JSON objektů.`;
  
  if (topic) {
    prompt += `\nZaměř se specificky na téma: ${topic}.`;
  }

  try {
    console.log("📡 Odesílám požadavek na Google AI...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log("✅ Odpověď z AI dorazila!");
    
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);

    return data.map((q: any, index: number) => ({
      ...q,
      id: Math.random().toString(36).substring(7) + index,
      subject,
      topic
    }));
  } catch (e) {
    console.error("❌ Chyba při generování:", e);
    alert("Došlo k chybě: " + (e instanceof Error ? e.message : "Neznámá chyba"));
    return [];
  }
}

export async function generateExam(subject: 'cesky_jazyk' | 'matematika'): Promise<Question[]> {
  return generateQuestions(subject, 10);
}
