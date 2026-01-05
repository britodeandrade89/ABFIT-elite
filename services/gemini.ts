import { GoogleGenAI, Type } from "@google/genai";
import { NutritionProfile, MealPlan, MacroNutrients } from "../types";

// Inicialização segura conforme diretrizes: usar process.env.API_KEY diretamente
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Modelos atualizados conforme regras de performance
const MODEL_PRO = 'gemini-3-pro-preview';
const MODEL_FLASH = 'gemini-3-flash-preview';
const MODEL_IMAGE = 'gemini-2.5-flash-image';

/**
 * Limpa blocos de código markdown para parsing JSON
 */
function cleanJsonString(text: string): string {
  return text.replace(/```json|```/g, "").trim();
}

/**
 * Geração de Periodização Científica (PhD Matveev/Bompa)
 */
export async function generatePeriodizationPlan(data: any): Promise<any> {
  const systemInstruction = `Você é um PhD em Fisiologia do Exercício. 
  Crie um mesociclo de 4 semanas técnico. 
  Responda APENAS JSON puro, sem blocos de markdown.`;

  const prompt = `Gere periodização para: ${data.name}, Objetivo: ${data.goal}, Frequência: ${data.daysPerWeek}x.
  JSON esperado: { "titulo": "...", "modelo_teorico": "...", "objetivo_longo_prazo": "...", "microciclos": [{"semana": 1, "tipo": "...", "pse_alvo": "...", "faixa_repeticoes": "..."}] }`;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_PRO,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    return text ? JSON.parse(cleanJsonString(text)) : null;
  } catch (error) {
    console.error("Gemini Periodization Error:", error);
    return null;
  }
}

/**
 * Geração de Imagem de Exercício via Nano Banana
 */
export async function generateExerciseImage(exerciseName: string): Promise<string | null> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_IMAGE,
      contents: { parts: [{ text: `High quality action shot of athlete performing ${exerciseName} in gym` }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    
    // Busca a parte inlineData no array de parts
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (e) { 
    return null; 
  }
}

/**
 * Cue Técnico Biomecânico
 */
export async function generateTechnicalCue(exerciseName: string) {
  try {
    const res = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Forneça um cue técnico biomecânico curto para: ${exerciseName}`,
    });
    return res.text || "Foco na execução controlada.";
  } catch (e) { return "Mantenha o core ativado."; }
}

export async function generateAIMealPlan(profile: NutritionProfile): Promise<MealPlan | null> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Plano alimentar para ${profile.goal}. Alvos: ${JSON.stringify(profile.dailyTargets)}`,
      config: { responseMimeType: "application/json" }
    });
    const text = response.text;
    return text ? JSON.parse(cleanJsonString(text)) : null;
  } catch (e) { return null; }
}

export async function estimateFoodMacros(food: string): Promise<MacroNutrients | null> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FLASH,
      contents: `Estime macros para: ${food}`,
      config: { responseMimeType: "application/json" }
    });
    const text = response.text;
    return text ? JSON.parse(cleanJsonString(text)) : null;
  } catch (e) { return null; }
}