import { Request, Response } from "express";
import { NextFunction } from "express-serve-static-core";
import { RfpService } from "../services/rfpServices";
import { AIService } from "../utils/aiService";
import { EmailService } from "../utils/emailService";
import createHttpError from "http-errors";
import { ProposalService } from "../services/proposalService";
import { Proposal } from "../models/proposalModel";

export class ProposalController {
  constructor(
    private rfpService: RfpService,
    private aiService: AIService,
    private emailService: EmailService,
    private proposalService: ProposalService
  ) {}
  async checkForProposal(req: Request, res: Response, next: NextFunction) {
    const { id: rfpId } = req.params;

   try {
     const rfp = await this.rfpService.getRfp(rfpId);
 
     if (!rfp) {
       const error = createHttpError(404, "RFP NOT FOUND");
       next(error);
       return;
     }
 
     //check inbox for new  emails with this id as refernce id
 
     const emailResponses = await this.emailService.checkForResponses(
       rfp[0]._id
     );
 

     if(emailResponses.length ===0){
      const error = createHttpError(400, "No new proposals found");
       next(error);
       return;
     }
     console.log("emailResponse", emailResponses);
 
     //adde that to proposal db
 
     for (const email of emailResponses) {
       //find vendor
       const exists = await Proposal.findOne({ messageId: email.messageId });

        if (exists) {
          console.log("Skipping duplicate email");
          continue;
        }

 
       let vendor = await rfp[0].vendors.find((vendor: any) => {
         return email.from.includes(vendor.email);
       });
 
       //parse response email to structured data
 
       const parsedData = await this.aiService.parseVendorProposal(
         email.text,
         rfp
       );
 
       console.log("parsed Email", parsedData);
 
       //create proposal document
 
       const proposal = await this.proposalService.createProposal(rfpId,vendor._id,email.text,parsedData,email.messageId);
       console.log(proposal)

      }


      res.json({
       success: true,
       message: "Proposals checked successfully",
     }); 
    } catch (error) {
    next(error)
    return
   }
  }
}
