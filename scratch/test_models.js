import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  console.log('Using API Key ending in:', apiKey.slice(-4));
  
  // Note: The JS SDK doesn't have a direct 'listModels' on the main class in all versions,
  // but we can try to fetch the list via REST if needed.
  // However, let's try the discovery endpoint or just test more names.
  
  const modelsToTest = [
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b',
    'gemini-1.5-pro',
    'gemini-pro',
    'gemini-1.0-pro'
  ];

  for (const m of modelsToTest) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("test");
      console.log(`✅ ${m} works!`);
      break;
    } catch (e) {
      console.log(`❌ ${m} failed: ${e.message}`);
    }
  }
}

listModels();
