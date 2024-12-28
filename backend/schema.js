import mongoose, { Mongoose } from "mongoose";

const yourSchema = new mongoose.Schema({
    // Define your schema fields here, for example:
    Name: String,
    Place: String,
    Review: String,
    Color: String,
    lat: mongoose.Types.Decimal128,
    lng: mongoose.Types.Decimal128
  });
  
export const YourModel = mongoose.model("database", yourSchema);
