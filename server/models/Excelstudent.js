import mongoose from "mongoose";

const ExcelstudentSchema = new mongoose.Schema({
    Fname: String,
    Lname: String,
    Email: String,
    EMIamount: Number,
    Balance: Number,
    Totalfees: Number,
    Coursename: String,
    Coursetype: String,
    Offer: String,
    Number: String,
    Date: String,
    
    // Allow additional dynamic fields
    additionalFields: {
        type: Map,
        of: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

}, {
    strict: false
});

const ExcelStudent= mongoose.model('ExcelStudent', ExcelstudentSchema);
export default ExcelStudent;

