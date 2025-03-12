import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
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
     group: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Group",
     },
     
},{ strict: false });

const Student= mongoose.model('Student', studentSchema);

export default Student;

