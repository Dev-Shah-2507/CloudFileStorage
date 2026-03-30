import express from "express"
import mongoose from "mongoose"
// import 'dotenv/config'
import dotenv from "dotenv";
dotenv.config();

// import {AuthDB} from "../modules/AuthDB.js"
import authRoutes from './routes/auth.js'
import cookieParser from "cookie-parser";
import cors from "cors"; // or const cors = require('cors');

import fileRoutes from './routes/files.js';

const app = express()
await mongoose.connect("mongodb+srv://devs24692_db_user:Dev1234@cluster0.fqtoglt.mongodb.net/secure-files-db?retryWrites=true&w=majority")

// Add this middleware BEFORE your routes
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://cloud-file-storage-steel.vercel.app"
  ],
  credentials: true
}));

app.get('/' , (req , res) => {
  res.send("Hello World !!")
})

app.use(cookieParser())
app.use(express.json())
// this helps in parsing data and fetching them directly like {val1,val2} from any req coming in any file from here 
app.use('/api/auth' , authRoutes)

app.use('/api/files' , fileRoutes) // ************************

app.listen(3000 , ()=> {
    console.log("Server listening at port 3000 !!");
})