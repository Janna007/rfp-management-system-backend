import { GoogleGenAI } from "@google/genai";
import { Config } from "../config";
import createHttpError from "http-errors";


const ai = new GoogleGenAI({
  apiKey: Config.GEMINI_API_KEY
});

export class AIService{

    async  parseRFPFromNaturalLanguage(naturalLanguage:string) {
        try {
         const prompt = `
         You are an AI assistant that converts procurement requests into structured data.
         
         User's procurement request:
         "${naturalLanguage}"
         
         Extract and return a JSON object with the following structure:
         {
           "title": "Brief title for this RFP",
           "description": "Full description",
           "items": [
             {
               "name": "Item name",
               "quantity": number,
               "specifications": "Item specs"
             }
           ],
           "budget": number (total budget),
           "deliveryDeadline": "ISO date string",
           "paymentTerms": "Payment terms",
           "warrantyRequirement": "Warranty requirement"
         }
         
         Return ONLY valid JSON, no additional text.
         `;
          const response =  await ai.models.generateContent({
             model: "gemini-2.5-flash",
             contents:prompt,
             config: {
              responseMimeType: "application/json",
              responseJsonSchema: {
                type:"object",
                properties:{
                  title: { type: "string" },
                  description: { type: "string" },
                  items:{
                    type:"array",
                    items:{
                      type:"object",
                      properties:{
                        name: { type: "string" },
                        quantity: { type: "number" },
                        specifications: { type: "string" }
                      }
                    }
                  },
                  budget: { type: "number" },
                  deliveryDeadline: { type: "string", format: "date-time" },
                  paymentTerms: { type: "string" },
                  warrantyRequirement: { type: "string" }
                },
                required: ["title", "description", "budget","deliveryDeadline"]
              }
            },
          });

          if(!response.text){
            const error = createHttpError(500, 'AI parsing error')
            throw error
          }
     
          const parsed = JSON.parse(response.text)
          return parsed
        } catch (err) {
           console.error('AI parsing error:', err);
           const error = createHttpError(500, 'AI parsing error')
           throw error
        }
    }

}





