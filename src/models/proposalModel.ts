import mongoose, {Schema } from "mongoose";

const PrposalSchema=new Schema({
    rfpId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"RFP"
    },
    vendorId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Vendor"
    },
    
    rawEmail: {
        subject: String,
        bodyText: String,
        bodyHtml: String,
      },
    
    // Structured data extracted by AI
    structuredData:{
        items: [{
            name: String,
            unitPrice: Number,
            quantity: Number,
            totalPrice: Number,
            specifications: String
          }],

          totalPrice: Number,
          deliveryTime: String,
          paymentTerms: String,
          warranty: String,
          additionalTerms: String,
    },

     // AI-generated evaluation
  aiScore: Number, // 0-100
  aiSummary: String,
  completeness: Number, // How well they answered the RFP

  status: { 
    type: String, 
    enum: ['received', 'parsed', 'evaluated'],
    default: 'received'
  }
    
},{timestamps:true})

export const Proposal=mongoose.model("Proposal",PrposalSchema)