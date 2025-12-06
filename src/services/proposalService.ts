import createHttpError from "http-errors";
import { Proposal } from "../models/proposalModel";

export class ProposalService {
    async createProposal(rfpId:string,vendorId:string,rawEmail:string,parsedData:any,messageId:string){
      try {
        return await Proposal.create({
            rfpId,
            vendorId,
            rawEmail,
            status:"parsed",
            messageId,
            ...parsedData
        })
        
      } catch (err) {
        console.log(err)
        const error = createHttpError(500, 'Error while saving  Proposal data')
        throw error
      }
    }
}