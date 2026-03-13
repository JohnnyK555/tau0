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
  console.log("🚀 FUNKCE SPUŠTĚNA");
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log("🔑 Klíč přítomen:", !!apiKey);

  if (!apiKey) {
    console.error("❌ Kritická chyba: API klíč není v Netlify nastaven!");
    return [];
  }

  try {
    // 1. Správná inicializace klienta
    const genAI = new GoogleGenAI(apiKey);
    
    // 2. Správné získání modelu (gemini-1.5-flash je nejstabilnější)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const subjectName = subject === 'cesky_jazyk' ? 'Český jazyk' : 'Matematika';
    const prompt = `Vygeneruj ${count} testových otázek pro přijímačky na SŠ z předmětu ${subjectName}. Vrať POUZE pole JSON.`;

    console.log("📡 TEĎ odesílám požadavek do sítě...");
    
    // 3. OPRAVA: Voláme model.generateContent, ne ai.models...
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ AI odpověděla!");

    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson).map((q: any, index: number) => ({
      ...q,
      id: Math.random().toString(36).substring(7) + index,
      subject,
      topic
    }));

  } catch (e) {
    console.error("❌ CHYBA V KOMUNIKACI:", e);
    return [];
  }
}

export async function generateExam(subject: 'cesky_jazyk' | 'matematika'): Promise<Question[]> {
  return generateQuestions(subject, 10);
}
