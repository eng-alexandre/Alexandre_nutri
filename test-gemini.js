import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    // There is no direct listModels in the SDK but we can fetch it via REST
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
    const data = await response.json();
    console.log("Modelos Disponíveis para sua API Key:");
    if (data.models) {
        data.models.forEach(model => {
            if (model.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${model.name}`);
            }
        });
    } else {
        console.log(data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

listModels();
