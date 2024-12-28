import dotenv from "dotenv"
dotenv.config()
import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import bodyParser from "body-parser"
import { YourModel } from "./schema.js"

const PORT= process.env.PORT || 3000;
const MONGODB_URI=process.env.MONGODB_URI || "mongodb+srv://amansharmaas536:amansharma@cluster1.k6vos.mongodb.net/UnderRadar?retryWrites=true&w=majority&appName=Cluster1";

const db=await mongoose.connect(MONGODB_URI).then(()=>{
    console.log("done")
}).catch((err)=>{
    console.log(err);
})


const app=express()
app.use(cors())
app.use(bodyParser.json())
app.use(express.json())


app.get("/", async (req,res)=>{
    try {
        let data = await YourModel.find();
        if (data.length > 0) {
            const response = data.map(item => ({
                Name: item.Name,
                Place: item.Place,
                Review: item.Review,
                Color: item.Color,
                lat: item.lat,
                lng: item.lng,
            }));
            res.json(response);
        } else {
            res.status(404).json({ message: "No items found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
})
app.post("/",async (req,res)=>{
    console.log(req.body);
    const data=new YourModel(req.body)
    const saved=await data.save()
})
app.listen(PORT)