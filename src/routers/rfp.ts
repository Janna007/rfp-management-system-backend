import express, { NextFunction, Request, Response } from 'express'
import { RfpController } from '../controllers/rfpController'
import { RfpService } from '../services/rfpServices'
import { AIService } from '../utils/aiService'

const router=express.Router()

const rfpService=new RfpService()
const aiService=new AIService()
const rfpController=new RfpController(rfpService,aiService)

router.post(
    '/',
    (req: Request, res: Response, next: NextFunction) =>
        rfpController.parseRfpInput(req, res, next),
)

router.get(
    '/',
    (req: Request, res: Response, next: NextFunction) =>
        rfpController.getAllRfps(req, res, next),
)





export default router