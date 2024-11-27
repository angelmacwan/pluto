const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI("API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateAiCode = async (data) => {
    // const prompt = "ONLY RESPOND WITH PYTHON CODE AND NOTHING ELSE. write python code for train test split";
    // const result = await model.generateContent(prompt);
    // return result.response.text();
    return "x = 'ai generated code'"
}
