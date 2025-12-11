import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchStockPrice = async (symbol: string): Promise<{ price: number; name: string } | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Use a model capable of search
      contents: `Find the current stock price and full company name for "${symbol}". 
      If it is a Taiwan stock, provide the price in TWD. If US, in USD.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            price: { type: Type.NUMBER, description: "The current stock price" },
            name: { type: Type.STRING, description: "The full name of the company" },
          },
          required: ["price", "name"]
        }
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Stock Fetch Error:", error);
    return null;
  }
};

export const getFinancialAdvice = async (
  totalBalance: number, 
  expenseSummary: string, 
  portfolioSummary: string
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI Service Unavailable (Check API Key)";

  try {
    const prompt = `
      You are a wise financial advisor. 
      My Total Bank Balance: ${totalBalance}
      My Recent Top Expenses: ${expenseSummary}
      My Stock Portfolio: ${portfolioSummary}
      
      Give me a concise, 3-sentence summary of my financial health and 1 specific actionable tip.
      Tone: Professional but encouraging.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Could not generate advice.";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "Could not generate advice due to an error.";
  }
};
