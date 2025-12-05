import { NextFunction, Request, Response } from "express";
import { RfpService } from "../services/rfpServices";
import { AIService } from "../utils/aiService";

export class RfpController{
    constructor(private rfpService:RfpService,private aiService:AIService){}
    async  parseRfpInput(req: Request, res: Response, next: NextFunction){
       //  Use AI to parse natural language from body into structured data

       const {naturalLanguageText}=req.body

       try {
         //call ai service  to parse natural language to structured json
        const parsedRFP=await this.aiService.parseRFPFromNaturalLanguage(naturalLanguageText)
        // console.log(parsedRFP)

        const rfp=await this.rfpService.createRfp(parsedRFP)

        res.json({
          success: true,
          message: 'RFP created successfully',
          rfp: rfp
        });
       } catch (error) {
         next(error)
         return
       }

      

    }
    async getAllRfps(req: Request, res: Response, next: NextFunction){
       try {
        const rfps=await this.rfpService.getRfps()

        res.json({
          success: true,
          message: 'RFP fetcheds successfully',
          rfp: rfps
        });

        
       } catch (error) {
        next(error)
        return
       }
    }
}