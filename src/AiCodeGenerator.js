const { GoogleGenerativeAI } = require("@google/generative-ai");

export const generateAiCode = async (data) => {
    data = data.flat(Infinity);
    let promptJSON = []

    // Generate prompt
    for (let i of data) {
        if ('fileContent' in i.data) {
            delete i.data.fileContent
            delete i.data.filePath
        }
        promptJSON.push({
            operation_type: i.type,
            parameters: i.data
        })
    }
    promptJSON = JSON.stringify(promptJSON, null, 2)

    // get API key
    const API_KEY = localStorage.getItem('PLUTO_GEMINI_KEY');

    if (!API_KEY) {
        localStorage.setItem('PLUTO_GEMINI_KEY', prompt("ENTER GEMINI API KEY"));
        return "API KEY FOUND, PLEASE TRY AGAIN"
    }

    // GET API RESPONSE
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = "ONLY RESPOND WITH PYTHON CODE AND NOTHING ELSE. write python code for the following pipeline " + promptJSON;
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch {
        localStorage.removeItem('PLUTO_GEMINI_KEY');
        return "SOMETHING WENT WRONG WITH. PLEASE TRY AGAIN LATER"
    }
}
