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
  
  // SEM VLOŽ SVŮJ KLÍČ MEZI UVOZOVKY
  const apiKey = "SEM_VLOZ_TVUJ_API_KLIC_AIzaSy..."; 
  
  console.log("🔑 Používám klíč natvrdo vložený v kódu");

  if (!apiKey || apiKey.startsWith("SEM_VLOZ")) {
    console.error("❌ Chyba: Zapomněl jsi do kódu vložit ten skutečný klíč!");
    return [];
  }

  try {
    const genAI = new GoogleGenAI(apiKey);
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const subjectName = subject === 'cesky_jazyk' ? 'Český jazyk' : 'Matematika';
    const prompt = `Vygeneruj ${count} testových otázek pro přijímačky na SŠ z předmětu ${subjectName}. Vrať POUZE pole JSON podle schématu Question.`;

    console.log("📡 TEĎ odesílám požadavek do sítě s hardcoded klíčem...");
    
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
    // Pokud ti to napíše "API Key not valid", je v tom klíči překlep
    return [];
  }
}

export async function generateExam(subject: 'cesky_jazyk' | 'matematika'): Promise<Question[]> {
  return generateQuestions(subject, 10);
}
