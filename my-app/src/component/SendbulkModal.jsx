import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SendbulkModal.css";
import apiConfig from "../apiconfig/apiConfig";
import { useNavigate } from "react-router-dom";

const SendbulkModal = ({ isOpen, onClose, previewContent = [],bgColor}) => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
    const [isProcessingsch, setIsProcessingsch] = useState(false);

  const [isScheduled, setIsScheduled] = useState(false); // Toggle state
  const [previewtext, setPreviewtext] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const campaign = JSON.parse(localStorage.getItem("campaign"));
  const navigate=useNavigate();



  useEffect(() => {
    if (isOpen) {
      console.log("PreviewContent in SendbulkModal:", previewContent); // Log to verify
    }
  }, [isOpen, previewContent]);

  // Fetch groups on modal open
  useEffect(() => {
    if (isOpen) {
      axios
        .get(`${apiConfig.baseURL}/api/stud/groups/${user.id}`)
        .then((response) => setGroups(response.data))
        .catch((error) => {
          console.error("Error fetching groups:", error);
          toast.error("Failed to fetch groups.");
        });
    }
  }, [isOpen,user]);

  
const sendscheduleBulk = async () => {

   if (!selectedGroup || !message || !previewtext) {
    toast.warning("Please select a group and enter a message and preview text.");
    return;
  }

  if (!previewContent || previewContent.length === 0) {
    toast.warning("No preview content available.");
    return;
  }
  if (!scheduledTime) {
        toast.error("Please Select Date And Time");
        return;
    }

  setIsProcessingsch(true);


  try {
    // Fetch students from the selected group
    const studentsResponse = await axios.get(
      `${apiConfig.baseURL}/api/stud/groups/${selectedGroup}/students`
    );
    const students = studentsResponse.data;

    if (students.length === 0) {
      toast.warning("No students found in the selected group.");
      setIsProcessingsch(false);
      return;
    }
    
        // Store initial campaign history with "Pending" status
        const campaignHistoryData = {
            campaignname: campaign.camname,
            groupname: groups.find(group => group._id === selectedGroup)?.name, // Get the group name from the groups array
            totalcount:students.length,
            recipients:"no mail",
            sendcount: 0,
            failedcount: 0,
            failedEmails:0,
            sentEmails:0,
            subject:message,
            exceldata:[{}],
            previewtext,
            previewContent,bgColor,
            scheduledTime: new Date(scheduledTime).toISOString(),  
            status: "Scheduled On",
            senddate: new Date().toLocaleString(),
            user: user.id,
            groupId:selectedGroup,
        };

        const campaignResponse = await axios.post(`${apiConfig.baseURL}/api/stud/camhistory`, campaignHistoryData);
        console.log("Initial Campaign History Saved:", campaignResponse.data);
        toast.success("Email scheduled successfully!");
        navigate("/home");
        sessionStorage.removeItem("firstVisit");
        sessionStorage.removeItem("toggled");
      }
      catch (error) {
        console.error("Error scheduling email:", error);
        toast.error("Failed to schedule email.");
    } 
    finally{
      setIsProcessingsch(false);
    }
  }

const handleSend = async () => {
  if (!selectedGroup || !message || !previewtext) {
    toast.warning("Please select a group and enter a message and preview text.");
    return;
  }

  if (!previewContent || previewContent.length === 0) {
    toast.warning("No preview content available.");
    return;
  }
       setIsProcessing(true);
           navigate("/home");
           sessionStorage.removeItem("firstVisit");
           sessionStorage.removeItem("toggled");



    let sentEmails = [];
    let failedEmails = [];

  try {
    // Fetch students from the selected group
    const studentsResponse = await axios.get(
      `${apiConfig.baseURL}/api/stud/groups/${selectedGroup}/students`
    );
    const students = studentsResponse.data;

    if (students.length === 0) {
      toast.warning("No students found in the selected group.");
      setIsProcessing(false);
      return;
    }
    
        // Store initial campaign history with "Pending" status
        const campaignHistoryData = {
            campaignname: campaign.camname,
            groupname: groups.find(group => group._id === selectedGroup)?.name, // Get the group name from the groups array
            totalcount:students.length,
            recipients:"no mail",
            sendcount: 0,
            failedcount: 0,
            failedEmails:0,
            sentEmails:0,
            subject:message,
            exceldata:[{}],
            previewtext,
            previewContent,bgColor,
            scheduledTime:new Date(),
            status: "Pending",
            senddate: new Date().toLocaleString(),
            user: user.id,
            groupId:selectedGroup,
        };

        const campaignResponse = await axios.post(`${apiConfig.baseURL}/api/stud/camhistory`, campaignHistoryData);
        const campaignId = campaignResponse.data.id; // Assume response includes campaign ID
        console.log("Initial Campaign History Saved:", campaignResponse.data);


  
    for (const student of students) {
      const personalizedContent = previewContent.map((item) => {
        const personalizedItem = { ...item };

        if (item.content) {
          Object.entries(student).forEach(([key, value]) => {
            const placeholderRegex = new RegExp(`\\{?${key}\\}?`, "g");
            const cellValue = value != null ? String(value).trim() : "";
            personalizedItem.content = personalizedItem.content.replace(placeholderRegex, cellValue);
          });
        }
        return personalizedItem;
      });

      const emailData = {
        recipientEmail: student.Email,
        subject: message,
        body: JSON.stringify(personalizedContent),
        bgColor,
        previewtext,
        userId: user.id,
        groupId: selectedGroup,
      };

      try {
        console.log("Sending email data:", emailData);
        await axios.post(`${apiConfig.baseURL}/api/stud/sendbulkEmail`, emailData);
        sentEmails.push(student.Email);
      } catch (error) {
        console.error(`Failed to send email to ${student.Email}:`, error);
        failedEmails.push(student.Email);
      }
    }

      // Update campaign history with final status
        const finalStatus = failedEmails.length > 0 ? "Failed" : "Success";
        await axios.put(`${apiConfig.baseURL}/api/stud/camhistory/${campaignId}`, {
            sendcount: sentEmails.length,
            sentEmails:sentEmails,
            failedEmails: failedEmails.length > 0 ? failedEmails : 0,  
            failedcount: failedEmails.length > 0 ? failedEmails.length : 0, // Ensure failedcount is 0, not an empty array
            status: finalStatus,
        });
    toast.success("Emails sent successfully!");
  
  } catch (error) {
    console.error("Error sending emails:", error);
    toast.error("Failed to send emails.");
    setIsProcessing(false);
  }
};


  if (!isOpen) return null;

  return (
    <div className="send-modal-overlay">
      <div className="send-modal-content">
        <button className="send-modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>Send Bulk Mail</h2>
        <div className="send-modal-form">
          <label htmlFor="group-select">Select Group:</label>
          <select
            id="group-select"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">-- Select Group --</option>
            {groups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.name}
              </option>
            ))}
          </select>

          <label htmlFor="subject-input">Subject:</label>
          <textarea
            id="subject-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here"
          />

          <label htmlFor="preview-text">Preview Text:</label>
          <textarea
            id="preview-text"
            value={previewtext}
            onChange={(e) => setPreviewtext(e.target.value)}
            placeholder="Enter your Preview text here"
          />

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
              <label htmlFor="schedule-time">Set Schedule Time:</label>{" "}
              <input
                type="datetime-local"
                id="schedule-time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          )}

          <div className="action-btn">
            <button
              className="send-modal-submit-btn"
              onClick={handleSend}
              disabled={isProcessing || isScheduled} // Disable if scheduled is enabled
            >
              {isProcessing ? "Processing..." : "Send Now"}
            </button>

            <button
              onClick={sendscheduleBulk}
              className="send-modal-submit-btn"
              disabled={isProcessingsch || !isScheduled} // Disable if scheduled is not enabled
            >
              {isProcessingsch ? "Processing..." : "Scheduled"}
            </button>
          </div>
        </div>
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

export default SendbulkModal;