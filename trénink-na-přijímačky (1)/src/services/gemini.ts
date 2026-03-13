import { GoogleGenAI } from "@google/genai";

// Vytvoření klienta pomocí správného názvu pro tvou knihovnu
const genAI = new GoogleGenAI(import.meta.env.VITE_GEMINI_API_KEY);

// Nastavení modelu
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  }
});

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
  let prompt = `Vygeneruj ${count} typických testových otázek z předmětu ${subjectName} pro přípravu na jednotné přijímací zkoušky na střední školy v ČR (9. třída, formát Cermat).
  
  U uzavřených otázek (multiple_choice) uveď 4 možnosti (A, B, C, D). U otevřených otázek (open_ended) nech pole options prázdné. Odpověď musí být přesná hodnota nebo text správné možnosti.
  
  Vrať POUZE čisté pole JSON objektů podle schématu.`;
  
  if (topic) {
    prompt += `\nZaměř se specificky na téma: ${topic}.`;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonStr = response.text().trim() || "[]";
    
    const data = JSON.parse(jsonStr);
    return data.map((q: any, index: number) => ({
      ...q,
      id: Math.random().toString(36).substring(7) + index,
      subject,
      topic
    }));
  } catch (e) {
    console.error("Chyba při komunikaci s Gemini:", e);
    return [];
  }
}

export async function generateExam(subject: 'cesky_jazyk' | 'matematika'): Promise<Question[]> {
  return generateQuestions(subject, 10);
}
