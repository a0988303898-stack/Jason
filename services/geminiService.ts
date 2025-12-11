import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API Key not found in environment variables");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const fetchStockPrice = async (symbol: string): Promise<{ price: number; name: string; sources?: string[] } | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview", // Use a model capable of search
      contents: `Find the current stock price and full company name for "${symbol}". 
      If it is a Taiwan stock, provide the price in TWD. If US, in USD.
      Return the output as a JSON object with keys "price" (number) and "name" (string).`,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType and responseSchema are not supported with googleSearch
      },
    });

    const text = response.text;
    if (!text) return null;
    
    // Extract sources from grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks
      ?.map((chunk: any) => chunk.web?.uri)
      .filter((uri: any) => typeof uri === 'string') as string[] | undefined;

    // Extract JSON from text (in case of markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let data;
    if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
    } else {
        data = JSON.parse(text);
    }

    return { ...data, sources };
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