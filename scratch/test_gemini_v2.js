import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test(modelName, apiVersion) {
  console.log(`Testing ${modelName} with ${apiVersion}...`);
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion });
    const result = await model.generateContent("Hi");
    console.log(`Success with ${modelName} (${apiVersion})`);
    return true;
  } catch (error) {
    console.error(`Error with ${modelName} (${apiVersion}):`, error.message);
    return false;
  }
}

async function run() {
  const models = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-pro', 'gemini-2.0-flash-exp', 'gemini-2.0-flash'];
  const versions = ['v1beta', 'v1'];
  
  for (const v of versions) {
    for (const m of models) {
      const success = await test(m, v);
      if (success) break;
    }
  }
}

run();
