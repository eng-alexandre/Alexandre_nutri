import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Zod Schema to guarantee AI output shape
const MealPlanSchema = z.object({
  plano_semanal: z.array(
    z.object({
      dia: z.string(),
      refeicoes: z.object({
        cafe_da_manha: z.array(z.string()),
        lanche_manha: z.array(z.string()),
        almoco: z.array(z.string()),
        lanche_tarde: z.array(z.string()),
        jantar: z.array(z.string())
      })
    })
  )
});

export default async function handler(req, res) {
  // Allow CORS for local dev if hit directly
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error('GOOGLE_API_KEY not set');
      return res.status(500).json({ error: 'Internal Server Error: Missing API Key' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const patientData = req.body;
    
    // Formatting the patient data to be injected into the prompt
    const patientDataString = JSON.stringify({
      objetivos: patientData.objetivos || [],
      objetivo_texto: patientData.objetivo_texto || '',
      patologias: patientData.patologias || [],
      restricoes_alimentares: patientData.restricoes_alimentares || [],
      alergias: patientData.alergias || [],
      medicamentos: patientData.medicamentos || '',
      suplementos: patientData.suplementos || '',
      refeicoes_por_dia: patientData.refeicoes_por_dia || 5,
      nivel_atividade: patientData.nivel_atividade || 'Não informado',
      peso: patientData.peso_inicial || 'Não informado',
      altura: patientData.altura || 'Não informado',
      sexo: patientData.sexo || 'Não informado',
      idade: patientData.data_nascimento ? (new Date().getFullYear() - new Date(patientData.data_nascimento).getFullYear()) : 'Não informado',
      observacoes: patientData.observacoes || ''
    }, null, 2);

    const prompt = `Você é um nutricionista profissional.

Gere um plano alimentar semanal com base nos dados abaixo.

⚠️ Regras:
- Responda APENAS em JSON válido
- Não use markdown
- Não escreva explicações
- Respeite restrições e alergias

Dados do paciente:
${patientDataString}

Formato obrigatório:

{
  "plano_semanal": [
    {
      "dia": "Segunda-feira",
      "refeicoes": {
        "cafe_da_manha": ["", "", "", "", ""],
        "lanche_manha": ["", "", "", "", ""],
        "almoco": ["", "", "", "", ""],
        "lanche_tarde": ["", "", "", "", ""],
        "jantar": ["", "", "", "", ""]
      }
    }
  ]
}

Regras:
- gerar 7 dias
- 5 opções por refeição
- evitar repetição
- usar alimentos comuns no Brasil`;

    let attempt = 0;
    const MAX_RETRIES = 3;
    let validatedData = null;
    let lastError = null;

    while (attempt < MAX_RETRIES && !validatedData) {
      attempt++;
      try {
          let result;
          try {
              const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
              result = await model.generateContent({
                  contents: [{ role: "user", parts: [{ text: prompt }] }],
                  generationConfig: {
                      responseMimeType: "application/json",
                  }
              });
          } catch (modelError) {
              console.warn('Fallback: gemini-2.5-flash falhou, tentando gemini-flash-latest...', modelError.message);
              const fallbackModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
              result = await fallbackModel.generateContent({
                  contents: [{ role: "user", parts: [{ text: prompt }] }],
                  generationConfig: {
                      responseMimeType: "application/json",
                  }
              });
          }

          let responseText = result.response.text();
          responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
          
          const jsonResult = JSON.parse(responseText);

          // Zod Validation using safeParse
          const parseResult = MealPlanSchema.safeParse(jsonResult);
          
          if (parseResult.success) {
            validatedData = parseResult.data;
          } else {
            console.warn(`Zod Validation Failed (Attempt ${attempt}/${MAX_RETRIES}):`, parseResult.error.issues);
            lastError = 'A IA gerou o plano com formato incorreto. Faltam refeições ou propriedades.';
          }
      } catch (err) {
          console.warn(`Generation/Parse Failed (Attempt ${attempt}/${MAX_RETRIES}):`, err.message);
          lastError = err.message;
      }
    }

    if (!validatedData) {
      console.error('Failed to generate valid meal plan after MAX_RETRIES');
      return res.status(500).json({ 
        error: 'Erro de estrutura (Zod)', 
        details: `Após ${MAX_RETRIES} tentativas automáticas, a IA não conseguiu gerar o formato esperado. Último erro: ${lastError}` 
      });
    }

    return res.status(200).json(validatedData);
  } catch (error) {
    console.error('Fatal Error generating meal plan:', error);
    return res.status(500).json({ error: 'Erro ao gerar o plano alimentar', details: error.message });
  }
}
