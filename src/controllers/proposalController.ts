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

  async getAllProposals(req: Request, res: Response, next: NextFunction){
    try {
    
      const proposals=await this.proposalService.getProposals(req.params.id)

      res.json({
        success: true,
        message: 'RFP fetcheds successfully',
        data: proposals
      });
      
    } catch (error) {
      next(error)
      return
    }
  }

  async compareProposals(req: Request, res: Response, next: NextFunction){
      try {

        const rfp=await this.rfpService.getRfp(req.params.id)

        const proposals=await this.proposalService.getProposals(req.params.id)

        //compare prposals useing rfp and proposals 

        const comparison = await this.aiService.compareProposals(rfp[0], proposals);

        //store ai score

        for (const vendorScore of comparison.vendorScores) {
          // Find the matching proposal by vendorId
          const proposal = proposals.find(p => 
            p.vendorId._id.toString() === vendorScore.vendorId
          );
    
          if (proposal) {
            // Update the proposal with AI score and evaluation details
            await this.proposalService.updateProposal(proposal._id, {
              aiScore: vendorScore.score,
              aiSummary: vendorScore.pros,      // Optional: store pros     // Optional: store cons
              status: 'evaluated'            // Update status
            });
          }
        }

        res.json({ success: true, data:comparison });
        
      } catch (error) {
        next(error)
        return
      }
  }

  
}
