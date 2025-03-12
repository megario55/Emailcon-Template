import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBlE_NBNBNCqV2SiG25o3zTf-oSpZQOABw");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "give me fees pending email content";

const result = await model.generateContent(prompt);
console.log(result.response.text());