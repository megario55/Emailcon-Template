import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Importexcel.css";
import sampleexcel from "../Images/excelsheet.png";
import apiConfig from "../apiconfig/apiConfig";
import { useNavigate } from "react-router-dom";

const ExcelModal = ({ isOpen, onClose, previewContent = [],bgColor}) => {
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState("");
    const [isScheduled, setIsScheduled] = useState(false); // Toggle state
  const [previewtext, setPreviewtext] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const [isLoading, setIsLoading] = useState(false); // State for loader
    const [isLoadingsch, setIsLoadingsch] = useState(false); // State for loader

  const campaign = JSON.parse(localStorage.getItem("campaign"));
  const navigate=useNavigate();


  useEffect(() => {
    if (isOpen) {
      console.log("previewContent in SendexcelModal:",previewContent,bgColor);
    }
  }, [isOpen, previewContent,bgColor]);

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  setFileName(file.name);
  const reader = new FileReader();

  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Format the data as required
    const formattedData = jsonData
      .map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          if (colIndex === 10 && typeof cell === 'number') { // Assuming date is in column 10 (11th column)
            // Convert Excel date to JS date
            const jsDate = new Date(Math.round((cell - 25569) * 86400 * 1000)); // Excel date to JS timestamp
            return jsDate.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
          }
          return cell;
        })
      )
      .filter(row => row.some(cell => cell)); // Filter out empty rows

    setExcelData(formattedData);
    console.log(formattedData); // Log to verify data after conversion
  };

  reader.readAsArrayBuffer(file);
};

const sendscheduleExcel = async () => {

    if (excelData.length === 0) {
        toast.error("Please upload an Excel file first.");
        return;
    }

    if (excelData.length <= 1) {
        toast.error("Ensure excel data is uploaded.");
        return;
    }

    const [headers, ...rows] = excelData;

    if (!headers.includes("Email")) {
        toast.error("Excel file must have an 'Email' column.");
        return;
    }

    const emailIndex = headers.indexOf("Email");

    if (!previewContent || previewContent.length === 0) {
        toast.error("No Preview Content provided.");
        return;
    }
    
    if (!previewtext) {
        toast.error("Please Enter Previewtext.");
        return;
    }
     if (!scheduledTime) {
        toast.error("Please Select Date And Time");
        return;
    }
    
    if (!message) {
        toast.error("Please Enter Subject.");
        return;
    }
      setIsLoadingsch(true); // Show loader
    let sentEmails = [];
    let failedEmails = [];

    // Convert Excel data into an array of objects
    const formattedExcelData = rows.map(row => {
        return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || "";
            return obj;
        }, {});
    });

    try {   
        // Store initial campaign history with "Pending" status
        const campaignHistoryData = {
            campaignname: campaign.camname,
            groupname: "Instant Send",
            totalcount: rows.filter(row => row[emailIndex]).length, // Count non-empty emails
            sendcount: 0,
            recipients: "no mail",
            failedcount: 0,
            subject: message,
            previewtext,
            previewContent,
            bgColor,
            sentEmails,
            failedEmails,
            scheduledTime: new Date(scheduledTime).toISOString(),  
            status: "Scheduled On",
            senddate: new Date().toLocaleString(),
            user: user.id,
            groupId: "No id",
            exceldata: formattedExcelData, // Store Excel data inside campaign history
        };

        const campaignResponse = await axios.post(`${apiConfig.baseURL}/api/stud/camhistory`, campaignHistoryData);
        console.log("Initial Campaign History Saved:", campaignResponse.data);
           toast.success("Email scheduled successfully!");
        navigate("/home");
      }
      catch (error) {
        console.error("Error scheduling email:", error);
        toast.error("Failed to schedule email.");
    } 
    finally{
      setIsLoadingsch(false);
    }
  }

const handleSend = async () => {
  
    if (excelData.length === 0) {
        toast.error("Please upload an Excel file first.");
        return;
    }

    if (excelData.length <= 1) {
        toast.error("Ensure excel data is uploaded.");
        return;
    }

    const [headers, ...rows] = excelData;

    if (!headers.includes("Email")) {
        toast.error("Excel file must have an 'Email' column.");
        return;
    }

    const emailIndex = headers.indexOf("Email");

    if (!previewContent || previewContent.length === 0) {
        toast.error("No Preview Content provided.");
        return;
    }
    
    if (!previewtext) {
        toast.error("Please Enter Previewtext.");
        return;
    }
    
    if (!message) {
        toast.error("Please Enter Subject.");
        return;
    }
  setIsLoading(true); // Show loader
    navigate("/home");

    let sentEmails = [];
    let failedEmails = [];

    // Convert Excel data into an array of objects
    const formattedExcelData = rows.map(row => {
        return headers.reduce((obj, header, index) => {
            obj[header] = row[index] || "";
            return obj;
        }, {});
    });

    try {   
        // Store initial campaign history with "Pending" status
        const campaignHistoryData = {
            campaignname: campaign.camname,
            groupname: "Instant Send",
            totalcount: rows.filter(row => row[emailIndex]).length, // Count non-empty emails
            sendcount: 0,
            recipients: "no mail",
            failedcount: 0,
            subject: message,
            previewtext,
            previewContent,
            bgColor,
            sentEmails,
            failedEmails,
            scheduledTime: new Date(),
            status: "Pending",
            senddate: new Date().toLocaleString(),
            user: user.id,
            groupId: "No id",
            exceldata: formattedExcelData, // Store Excel data inside campaign history
        };

        const campaignResponse = await axios.post(`${apiConfig.baseURL}/api/stud/camhistory`, campaignHistoryData);
        const campaignId = campaignResponse.data.id; // Assume response includes campaign ID
        console.log("Initial Campaign History Saved:", campaignResponse.data);

        // Process each row and send emails
        for (const row of rows) {
            const email = row[emailIndex];
            if (!email) continue; // Skip if email is missing in the row

            // Generate personalized content from template
            const personalizedContent = previewContent.map(item => {
                const personalizedItem = { ...item }; // Copy the structure

                if (item.content) {
                    headers.forEach((header, index) => {
                        const placeholder = new RegExp(`{?${header.trim()}\\}?`, "g"); // Match placeholders like {Fname}
                        const cellValue = row[index] ? String(row[index]).trim() : ""; // Convert to string and trim
                        personalizedItem.content = personalizedItem.content.replace(placeholder, cellValue);
                    });
                }
                return personalizedItem;
            });

            const emailData = {
                recipientEmail: email,
                subject: message,
                body: JSON.stringify(personalizedContent),
                bgColor,
                previewtext,
                userId: user.id,
            };

            try {
                console.log("Sending email data:", emailData);
                await axios.post(`${apiConfig.baseURL}/api/stud/sendbulkEmail`, emailData);
                sentEmails.push(email);
            } catch (error) {
                console.error(`Failed to send email to ${email}:`, error);
                failedEmails.push(email);
            }
        }

        // Update campaign history with final status
        const finalStatus = failedEmails.length > 0 ? "Failed" : "Success";
        await axios.put(`${apiConfig.baseURL}/api/stud/camhistory/${campaignId}`, {
            sendcount: sentEmails.length,
            sentEmails,
            failedEmails: failedEmails.length > 0 ? failedEmails : [],
            failedcount: failedEmails.length,
            status: finalStatus,
        });

        toast.success("Emails sent successfully!");

    } catch (error) {
        console.error("Error sending emails:", error.response?.data || error.message);
        setIsLoading(false);
        toast.error("Failed to send emails. Check the console for details.");
    }
};


if (!isOpen) return null;

  return (
    <div className="excel-modal-overlay">
      <div className="excel-modal-content">
        <button className="excel-modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Upload and Send Emails</h2>
        <label htmlFor="subject-input">Subject:</label>
        <input
          type="text"
          id="subject-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter subject"
        />
          <label htmlFor="preview-input">Preview Text:</label>
        <input
          type="text"
          id="preview-input"
          value={previewtext}
          onChange={(e) => setPreviewtext(e.target.value)}
          placeholder="Enter Preview Text"
        />
        <div className="excel-modal-body">
          <h4>Sample excel format</h4>
          <img src={sampleexcel} alt="Sample Excel Format" className="sample-excel-image" />
           <div style={{display:"flex",gap:"10px"}}>
              <a href="../file/democsvfile.csv" download>
             <button className="modal-btn btn-download-sample">Download Sample csv File</button></a>
             <a href="../file/demoexcelfile.xlsx" download>
             <button className="modal-btn btn-download-sample">Download Sample xlsx File</button></a>
            </div>
          <h4>Upload excel file</h4>
          <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
          {fileName && <p>Uploaded File: {fileName}</p>}
          {excelData.length > 0 && (
            <button
              className="excel-modal-view-btn"
              onClick={() => {
                const table = document.getElementById("excel-table");
                table.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Uploaded List
            </button>
          )}
        </div>
        {excelData.length > 0 && (
          <div className="excel-table-container">
            <table id="excel-table">
              <thead>
                <tr>
                  {excelData[0].map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {excelData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
         {/* Toggle Button for Scheduled Mail */}
          <div className="toggle-container">
            
            <span>{isScheduled ? "Scheduled Mail Enabled :" : "Scheduled Mail Disabled :"}</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={() => setIsScheduled(!isScheduled)}
              />
              <span className="slider-send round"></span>
            </label>
          </div>
           {/* Show scheduled time input only if the toggle is enabled */}
          {isScheduled && (
            <div>
              <label htmlFor="schedule-time">Set Schedule Time:</label><br />
              <input
                type="datetime-local"
                id="schedule-time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          )}

            <button
              className="excel-modal-send-btn"
              onClick={handleSend}
              disabled={isLoading || isScheduled} // Disable if scheduled is enabled
            >
              {isLoading ? "Processing..." : "Send Now"}
            </button>

            <button
              onClick={sendscheduleExcel}
              className="excel-modal-send-btn"
              disabled={isLoadingsch || !isScheduled} // Disable if scheduled is not enabled
            >
              {isLoadingsch ? "Processing..." : "Scheduled"}
            </button>

      </div>
<ToastContainer className="custom-toast"
  position="bottom-center"
      autoClose= {2000} 
      hideProgressBar={true} // Disable progress bar
      closeOnClick= {false}
      closeButton={false}
      pauseOnHover= {true}
      draggable= {true}
      theme= "light" // Optional: Choose theme ('light', 'dark', 'colored')
/>
    </div>
  );
};

export default ExcelModal;
