import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

// Check for API Key presence safely
const apiKey = process.env.API_KEY || '';

let client: GoogleGenAI | null = null;

if (apiKey) {
  client = new GoogleGenAI({ apiKey });
} else {
  console.warn("Gemini API Key is missing. Chatbot will mock responses.");
}

export const sendMessageToGemini = async (
  message: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> => {
  if (!client) {
    return "I'm currently in offline mode (No API Key). Please browse our categories manually or contact support via WhatsApp.";
  }

  try {
    const model = client.models;
    
    // We construct the chat history for context
    const chatContents = history.map(h => ({
      role: h.role,
      parts: h.parts
    }));

    // Add current message
    chatContents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const response: GenerateContentResponse = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: chatContents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "I'm having trouble thinking right now. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I apologize, but I'm having trouble connecting to the design assistant. Please try contacting us directly via WhatsApp.";
  }
};
