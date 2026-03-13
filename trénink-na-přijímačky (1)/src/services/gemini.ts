import { GoogleGenAI } from "@google/genai";

// 1. Definice klíče - VLOŽ SVŮJ KLÍČ SEM
const MY_DIRECT_KEY = "AIzaSy..."; 

// 2. Vytvoření klienta hned při načtení souboru
const genAI = new GoogleGenAI(MY_DIRECT_KEY);

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
  console.log("🚀 FUNKCE SPUŠTĚNA");
  
  try {
    // Používáme už vytvořeného klienta genAI
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const subjectName = subject === 'cesky_jazyk' ? 'Český jazyk' : 'Matematika';
    const prompt = `Vygeneruj ${count} testových otázek pro přijímačky na SŠ z předmětu ${subjectName}. Vrať POUZE pole JSON.`;

    console.log("📡 Odesílám požadavek...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ Odpověď dorazila");

    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson).map((q: any, index: number) => ({
      ...q,
      id: Math.random().toString(36).substring(7) + index,
      subject,
      topic
    }));

  } catch (e) {
    console.error("❌ CHYBA:", e);
    return [];
  }
}

export async function generateExam(subject: 'cesky_jazyk' | 'matematika'): Promise<Question[]> {
  return generateQuestions(subject, 10);
}
