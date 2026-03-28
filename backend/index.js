import express from "express"
import mongoose from "mongoose"
import 'dotenv/config'
// import {AuthDB} from "../modules/AuthDB.js"
import authRoutes from './routes/auth.js'
import cookieParser from "cookie-parser";
import cors from "cors"; // or const cors = require('cors');

const app = express()
await mongoose.connect("mongodb://127.0.0.1:27017/AuthDB")

// Add this middleware BEFORE your routes
app.use(cors({
  origin: "http://localhost:5173", // URL of your Frontend (Check if it's 3000 or 5173)
  credentials: true // Allow cookies to be sent (important for login sessions)
}));

app.get('/' , (req , res) => {
  res.send("Hello World !!")
})

app.use(cookieParser())
app.use(express.json())
// this helps in parsing data and fetching them directly like {val1,val2} from any req coming in any file from here 
app.use('/api/auth' , authRoutes)

app.listen(3000 , ()=> {
    console.log("Server listening at port 3000 !!");
})