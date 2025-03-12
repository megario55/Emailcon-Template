import mongoose from "mongoose";

const camhistorySchema = new mongoose.Schema({
    campaignname: {
        type: String,
        required: true,
    },
    groupname: {
        type: String,
        required: true,
    },
    totalcount: {
        type: String,
        required: true,
    },
    sendcount: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
        required: true,
    },
    previewtext: {
        type: String,
        required: true,
    },
    failedcount: {
        type: String,
    },
    status: {
        type: String,
        required: true,
    },
    senddate: {
        type: String,
        required: true,
    },
    sentEmails: {
        type: [String],
    },
    failedEmails: {
        type: [String],
    },
    previewContent: {
        type: Array,
        required: true,
    },
    bgColor: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    scheduledTime: {
        type: Date,
    },
    recipients: {
        type: String,
    },
    groupId: {
        type: String,
    },
    exceldata: [{
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
        additionalFields: {
            type: Map,
            of: String,
        },
    }],
}, {
    timestamps: true, // Automatically stores createdAt and updatedAt
});

const Camhistory = mongoose.model("Camhistory", camhistorySchema);
export default Camhistory;
