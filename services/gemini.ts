
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionProfile, MealPlan, MacroNutrients } from "../types";

// Inicialização segura conforme diretrizes
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const GEMINI_COMPLEX_MODEL = "gemini-3-pro-preview";
const GEMINI_FAST_MODEL = "gemini-3-flash-preview";
const IMAGE_MODEL = "gemini-2.5-flash-image";

/**
 * Geração de Periodização de Nível PhD
 */
export async function generatePeriodizationPlan(data: any): Promise<any> {
  const systemInstruction = `Você é um Especialista em Fisiologia do Exercício e Metodologia do Treinamento (PhD EEFD/UFRJ).
    Sua tarefa é criar um MESOCICLO de 4 semanas extremamente técnico.
    
    BASE TEÓRICA OBRIGATÓRIA:
    - Periodização Clássica (Matveev)
    - Modelo de Cargas Concentradas (Verkhoshansky)
    - Modelo ATR (Issurin/Kaulin)
    - Ciência da Hipertrofia (Schoenfeld)

    REGRAS DE RESPOSTA:
    - Retorne APENAS o JSON.
    - O campo "notas_phd" deve explicar a escolha do modelo (ex: Linear vs Ondulatório).
    - Defina claramente a relação entre Volume e Intensidade ao longo das semanas (choque, ordinária, recuperação).`;

  const prompt = `Gere um plano de treinamento para:
    Atleta: ${data.name}
    Nível: ${data.level}
    Objetivo: ${data.goal}
    Modelo de Periodização: ${data.model}
    Fase do Macrociclo: ${data.phase}
    Frequência Semanal: ${data.daysPerWeek} dias
    Treino Concorrente (Corrida): ${data.concurrent ? 'Sim' : 'Não'}
    Histórico/Limitações: ${data.injuries || 'Nenhum'}

    Retorne este formato JSON:
    {
      "titulo": "Nome técnico do Mesociclo",
      "modelo_teorico": "Explicação do modelo aplicado",
      "objetivo_longo_prazo": "Visão do Macrociclo",
      "distribuicao_volume": "Séries por grupamento/KM semanais",
      "estrategia_concorrente": "Gestão de interferência biológica",
      "microciclos": [
        {
          "semana": 1,
          "tipo": "Ordinária/Choque/Recuperação",
          "foco": "Qualidade física principal",
          "faixa_repeticoes": "Ex: 6-8 (80-85% 1RM)",
          "pse_alvo": "Escala RPE 0-10",
          "descricao_carga": "Progressão pretendida"
        }
      ],
      "notas_phd": "Fundamentação científica detalhada"
    }`;

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_COMPLEX_MODEL,
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("Resposta vazia da IA");
    return JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
  } catch (error) {
    console.error("Gemini Periodization Error:", error);
    return null;
  }
}

export async function callGemini(prompt: string, systemInstruction: string = "", isJson: boolean = false): Promise<any> {
  try {
    const response = await ai.models.generateContent({
      model: GEMINI_FAST_MODEL,
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "Você é o Diretor Científico da ABFIT.",
        responseMimeType: isJson ? "application/json" : "text/plain",
      }
    });
    if (isJson) {
      return JSON.parse(response.text.replace(/```json/g, "").replace(/```/g, "").trim());
    }
    return response.text;
  } catch (error) {
    return isJson ? null : "Erro na conexão.";
  }
}

export async function generateExerciseImage(exerciseName: string): Promise<string | null> {
  const prompt = `Muscular Black athlete executing "${exerciseName}" in a luxury high-end gym, 8k resolution, cinematic lighting, biomechanically perfect form.`;
  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: prompt,
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) { return null; }
}

export async function generateBioInsight(student: any) {
  return await callGemini(`Analise: ${student.nome}, Objetivo: ${student.goal}, Lesões: ${student.injuryHistory}. Forneça 3 cuidados biomecânicos.`, "Fisiologista Sênior");
}

export async function generateTechnicalCue(exerciseName: string) {
  return await callGemini(`Dica técnica de ouro para: ${exerciseName}.`, "Treinador Biomecânico");
}

export async function generateAIMealPlan(profile: NutritionProfile) {
  return await callGemini(`Plano alimentar para ${profile.goal} com restrições ${profile.restrictions}.`, "Nutricionista PhD", true);
}

export async function estimateFoodMacros(foodInput: string) {
  return await callGemini(`Macros para: ${foodInput}`, "Analista Nutricional", true);
}
