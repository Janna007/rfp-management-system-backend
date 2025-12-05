import { config } from 'dotenv'
import path from 'path'


config({
    path: path.join(__dirname, `../../.env.${process.env.NODE_ENV || 'dev'}`),
})

const {
    PORT,
    MONGO_DB_URL
    
} = process.env

export const Config = {
    PORT,
    MONGO_DB_URL
}
