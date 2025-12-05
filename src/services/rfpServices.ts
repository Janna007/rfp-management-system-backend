import createHttpError from "http-errors"
import { RFP } from "../models/rfpModel"

export class RfpService{

    async createRfp(parsedRFP:any){
        try {
        const res= await RFP.create(parsedRFP)
        return res    
        } catch (err) {
            console.log(err)
            const error = createHttpError(500, 'Error while parsing data')
            throw error
        }
    }

    async getRfps(){
        try {
            const res= await RFP.aggregate([
                {
                    $lookup:{
                        from:'rfps',
                        localField:'selectedVendors',
                        foreignField:"_id",
                        as:"vendors"
                    }
                }
            ])
            return res    
            } catch (err) {
                console.log(err)
                const error = createHttpError(500, 'Error while parsing data')
                throw error
            }
    }
}