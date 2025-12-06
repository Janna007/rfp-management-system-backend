import createHttpError from "http-errors"
import { RFP } from "../models/rfpModel"
import { Vendor } from "../models/vendorModel"
import mongoose from "mongoose"

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
                        from:'vendors',
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

    async getRfp(rfpId:string){
        try {
            const res= await RFP.aggregate([
                {
                    $match: {
                      _id: new mongoose.Types.ObjectId(rfpId)
                    }
                  },
                {
                    $lookup:{
                        from:'vendors',
                        localField:'selectedVendors',
                        foreignField:"_id",
                        as:"vendors"
                    }
                }
            ])
            return res 
          } catch (err) {
            console.log(err);
            const error = createHttpError(500, "Error while getting rfp by ID");
            throw error;
          }
    }

    async getSelectedVendors(vendorIds:string[]){
        try {
            const vendors = await Vendor.find({ _id: { $in: vendorIds } });
            return vendors
        } catch (err) {
            console.log(err);
            const error = createHttpError(500, "Error while getting selected vendors");
            throw error;
        }
    }

    async updateSelectVendor(rfpId:string,vendorIds:string[]){
        try {
            return await RFP.findByIdAndUpdate(rfpId, {selectedVendors:vendorIds} , { new: true })
            .lean()
            .exec();      
        } catch (err) {
            console.log(err);
            const error = createHttpError(500, "Error while update selected vendors");
            throw error;
        }
    }
}