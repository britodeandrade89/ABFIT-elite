import { GoogleGenAI, Type } from "@google/genai";
import { NutritionProfile, MealPlan, MacroNutrients } from "../types";

// Ensure API key is present. Handle environment differences safely.
const getApiKey = () => {
  try {
    if (typeof process !== "undefined" && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
    // Fallback for browser-injected config if process.env isn't replaced by bundler
    if (typeof window !== "undefined" && (window as any).process?.env?.API_KEY) {
      return (window as any).process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Error accessing API KEY", e);
  }
  return "";
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

const GEMINI_MODEL = "gemini-2.5-flash-preview-09-2025";
const IMAGEN_MODEL = "imagen-4.0-generate-001";

export async function callGemini(prompt: string, systemInstruction: string = "", isJson: boolean = false): Promise<any> {
  if (!apiKey) {
    console.warn("API Key is missing for Gemini.");
    return isJson ? null : "API Key missing.";
  }

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "Você é o PhD Diretor Científico da ABFIT.",
        responseMimeType: isJson ? "application/json" : "text/plain",
      }
    });

    if (isJson) {
      try {
        let text = response.text || "{}";
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(text);
      } catch (e) {
        console.error("JSON Parse Error", e);
        return null;
      }
    }

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return isJson ? null : "Erro na ligação PhD.";
  }
}

export async function generateBioInsight(student: any): Promise<string> {
  if (!apiKey) return "";
  const prompt = `Analise este perfil de aluno e forneça 3 orientações curtas e cruciais para o treinador. 
    Aluno: ${student.nome}, Idade: ${student.age || 'N/A'}, Objetivo: ${student.goal || 'Geral'}.
    Histórico: ${student.injuryHistory || 'Nenhum'}.
    Foque em: Segurança Biomecânica, Estratégia de Foco e Gestão de Energia.`;
  
  return await callGemini(prompt, "Você é um Fisiologista Sênior.");
}

export async function generateTechnicalCue(exerciseName: string, studentInfo: string = ""): Promise<string> {
  if (!apiKey) return "";
  const prompt = `Forneça uma dica técnica de "ouro" para o exercício "${exerciseName}". 
    ${studentInfo ? `Considere: ${studentInfo}.` : ''} 
    Seja breve, prático e focado na biomecânica.`;
  
  return await callGemini(prompt, "Você é um Treinador Biomecânico de Elite.");
}

export async function analyzeExerciseBiomechanics(exerciseName: string): Promise<any> {
  if (!apiKey) return null;
  const prompt = `Analise o exercício "${exerciseName}". 
      Instruções obrigatórias:
      - Se o nome contém "HBC", o equipamento deve ser obrigatoriamente um Haltere (Dumbbell). Nunca use barras se o nome diz HBC.
      - Se o nome contém "HBL", use obrigatoriamente Barra Longa.
      - Se o nome contém "alternado", descreva uma execução onde um membro está em cima (contração máxima) e o outro embaixo (início).
      - Se o nome contém "sumô", descreva a postura de pernas bem afastadas e pés para fora.
      - Se o nome contém "frontal", descreva a barra sobre os ombros (front rack).
      
      Forneça:
      1. Descrição técnica da execução perfeita em português.
      2. 3 Benefícios principais em português.
      3. Um PROMPT VISUAL DETALHADO em INGLÊS para gerar uma foto 8k. O prompt deve descrever: O atleta preto musculoso, a posição exata do equipamento, a biomecânica asimétrica (se alternado), a iluminação de ginásio moderno de luxo.
      
      Responda APENAS em JSON: {"description": "", "benefits": "", "visualPrompt": ""}`;

  return await callGemini(prompt, "Você é um Especialista em Biomecânica.", true);
}

export async function generateExerciseImage(exerciseName: string, customPrompt?: string): Promise<string | null> {
  if (!apiKey) return null;
  
  let prompt = customPrompt;

  if (!prompt) {
      let biomechanicalRefinement = "Ensuring perfect biomechanics.";
      const nameLower = exerciseName.toLowerCase();

      if (nameLower.includes("banco 75")) biomechanicalRefinement += " The bench is at a high incline of 75 degrees (almost vertical).";
      if (nameLower.includes("banco 45")) biomechanicalRefinement += " The bench is at a standard incline of 45 degrees.";
      if (nameLower.includes("banco declinado")) biomechanicalRefinement += " The bench is declined, head lower than hips.";

      if (nameLower.includes("alternado")) biomechanicalRefinement += " The athlete is performing the movement alternating arms (one up, one down).";
      if (nameLower.includes("unilateral")) biomechanicalRefinement += " The athlete is performing the movement with only one side/arm/leg active.";
      if (nameLower.includes("pegada neutra")) biomechanicalRefinement += " Hands palms facing each other (neutral grip).";
      if (nameLower.includes("pegada supinada")) biomechanicalRefinement += " Palms facing up/forward (supinated grip).";
      if (nameLower.includes("pegada pronada")) biomechanicalRefinement += " Palms facing down/back (pronated grip).";

      if (nameLower.includes("supino reto") || (nameLower.includes("supino") && nameLower.includes("reto"))) {
        biomechanicalRefinement += " CRITICAL BIOMECHANICS: Flat Bench Press. The athlete must be LYING COMPLETELY HORIZONTAL and FLAT on a bench. The weights are being pressed directly above the chest. The athlete MUST NOT be sitting or inclined.";
      } else if (nameLower.includes("supino inclinado")) {
        biomechanicalRefinement += " CRITICAL BIOMECHANICS: Incline Bench Press. The bench is at a 45-degree angle. The athlete is leaning back on the incline. The dumbbells or barbell are pressed from the upper chest towards the ceiling.";
      } else if (nameLower.includes("crossover") && nameLower.includes("alta")) {
        biomechanicalRefinement += " CRITICAL BIOMECHANICS: High-to-Low Cable Crossover. The athlete is standing. The arms move in an arc from a high position to a low-forward position. The hands MUST meet or cross exactly at the level of the NIPPLES (chest level) for maximum pec contraction.";
      } else if (nameLower.includes("frontal") || nameLower.includes("sobre ombros")) {
        biomechanicalRefinement += " CRITICAL BIOMECHANICS: Front Squat / Front Rack. The barbell rests on the front shoulders (front rack position), elbows held high and pointing forward. Barbell MUST NOT be on the back.";
      } else if (nameLower.includes("agachamento livre") || nameLower.includes("back squat")) {
        biomechanicalRefinement += " Traditional Back Squat. Barbell is resting on the upper back/trapezius.";
      } else if (nameLower.includes("vela")) {
        biomechanicalRefinement += " Gymnast style: Athlete is on the floor, raising legs and hips towards the ceiling until vertical (Candlestick position).";
      }

      prompt = `Cinema-grade 8k raw photograph of a muscular Black athlete perfectly executing the exercise "${exerciseName}" in a high-end futuristic gym. ${biomechanicalRefinement} Peak muscle contraction, glistening sweat, volumetric lighting, high contrast, wide shot, professional fitness photography.`;
  }
  
  try {
    const response = await ai.models.generateImages({
        model: IMAGEN_MODEL,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    const base64 = response.generatedImages?.[0]?.image?.imageBytes;
    return base64 ? `data:image/jpeg;base64,${base64}` : null;
  } catch (error) {
    console.error("Imagen Error:", error);
    return null;
  }
}

// --- Periodization AI ---

export async function generatePeriodizationPlan(studentData: any): Promise<any> {
  if (!apiKey) return null;

  const isRunning = studentData.type === 'RUNNING';

  const systemPrompt = `Você é um Especialista em ${isRunning ? 'Corrida de Rua' : 'Musculação e Treinamento de Força (EEFD/UFRJ)'}.
    Foque estritamente na PERIODIZAÇÃO (variáveis de carga).
    
    TUDO EM PORTUGUÊS.
    
    ESTRUTURA DE RESPOSTA (JSON):
    1. titulo: Nome do Macrociclo.
    2. volume_por_grupo: ${isRunning ? 'Volume semanal em KM' : 'Séries totais por GRUPO MUSCULAR por semana'}.
    3. microciclos: Array de 4 semanas (semana, foco, faixa_repeticoes, pse_alvo).
    4. detalhes_treino: Texto explicativo detalhado.
    
    LÓGICA BASEADA NA CONDIÇÃO:
    - Sedentário/Voltando: Começo conservador, foco em técnica/volume baixo.
    - Estagnado: Choque de volume/metodologia.
    - Alta Performance: Intensidade próxima da falha ou pace alto.
  `;

  const userQuery = `Gere uma periodização de 4 semanas para ${studentData.name}.
    Tipo: ${isRunning ? 'CORRIDA' : 'MUSCULAÇÃO'}
    Objetivo: ${studentData.goal}.
    Ritmo/Condição Atual: ${studentData.regularity}.
    ${!isRunning ? `Divisão de Treino: ${studentData.splitPreference}.` : ''}
    Dias por semana: ${studentData.daysPerWeek}.`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userQuery,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    let text = response.text || "{}";
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Periodization Error:", error);
    return null;
  }
}

// --- Nutrition AI Functions ---

export async function generateAIMealPlan(profile: NutritionProfile): Promise<MealPlan | null> {
  const prompt = `
    Generate a one-day meal plan for a client with the following profile:
    Goal: ${profile.goal}
    Restrictions: ${profile.restrictions || "None"}
    
    Return a JSON object with this structure:
    {
      "breakfast": "Description of meal",
      "lunch": "Description of meal",
      "dinner": "Description of meal",
      "snacks": "Description of snacks",
      "targetMacros": {
        "calories": number,
        "protein": number (grams),
        "carbs": number (grams),
        "fat": number (grams)
      }
    }
  `;
  
  const data = await callGemini(prompt, "You are a world-class Sports Nutritionist.", true);
  if (data) {
    return {
      id: Date.now().toString(),
      generatedDate: new Date().toISOString(),
      goal: profile.goal,
      ...data
    };
  }
  return null;
}

export async function estimateFoodMacros(foodDescription: string): Promise<MacroNutrients | null> {
  const prompt = `
    Analyze the nutritional content of the following food/meal: "${foodDescription}".
    Estimate the macronutrients.
    Return ONLY a JSON object:
    {
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  `;
  
  return await callGemini(prompt, "You are a precise nutrition analyzer.", true);
}