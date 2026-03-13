import { GoogleGenAI } from "@google/genai";

// Definujeme interface, aby zbytek aplikace věděl, jak vypadá otázka
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
  // 1. Načtení klíče až ve chvíli, kdy ho potřebujeme
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Chyba: API klíč není nastaven v prostředí Netlify (VITE_GEMINI_API_KEY)");
    return [];
  }

  // 2. Inicializace AI až tady uvnitř funkce
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
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Odstranění případných markdown značek, pokud by je tam AI dala
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);

    return data.map((q: any, index: number) => ({
      ...q,
      id: Math.random().toString(36).substring(7) + index,
      subject,
      topic
    }));
  } catch (e) {
    console.error("Chyba při generování otázek:", e);
    return [];
  }
}

export async function generateExam(subject: 'cesky_jazyk' | 'matematika'): Promise<Question[]> {
  return generateQuestions(subject, 10);
}
