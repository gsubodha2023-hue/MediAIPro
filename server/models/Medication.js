import mongoose from "mongoose";
const schema=new mongoose.Schema({genericName:{type:String,required:true,index:true},brandNames:[String],purpose:String,precautions:[String],interactions:[String],isActive:{type:Boolean,default:true}},{timestamps:true});
export default mongoose.model("Medication",schema);
