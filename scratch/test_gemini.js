import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  try {
    // There is no direct listModels in the JS SDK that I remember being standard across all versions,
    // but I can try a simple request or check version.
    console.log('Testing gemini-1.5-flash...');
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hi");
    console.log('Success with gemini-1.5-flash');
  } catch (error) {
    console.error('Error with gemini-1.5-flash:', error.message);
    
    try {
      console.log('Testing gemini-pro...');
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent("Hi");
      console.log('Success with gemini-pro');
    } catch (e2) {
      console.error('Error with gemini-pro:', e2.message);
    }
  }
}

listModels();
