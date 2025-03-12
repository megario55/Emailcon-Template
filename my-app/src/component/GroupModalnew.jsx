import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./GroupModal.css";
import * as XLSX from "xlsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import sampleexcels from "../Images/excelsheet.png";
import apiConfig from "../apiconfig/apiConfig.js";

const GroupModalnew = ({ onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [uploadedData, setUploadedData] = useState([]);
  const [selectedGroupForUpload, setSelectedGroupForUpload] = useState(null);
  const [groups, setGroups] = useState([]);
  const [fileName, setFileName] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user) {
        navigate("/"); // Redirect to login if user is not found
        return;
      }

      try {
        const res = await axios.get(
          `${apiConfig.baseURL}/api/stud/groups/${user.id}`
        );
        setGroups(res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch groups");
      }
    };

    fetchGroups();
  }, [user, navigate]); // Ensure useEffect is dependent on `user` and `navigate`

  const handleGroupCreate = () => {
    if (!user || !user.id) {
      toast.error("Please ensure the user is valid");
      return; // Stop further execution if user is invalid
    }
    if (groupName && user && user.id) {
      axios
        .post(`${apiConfig.baseURL}/api/stud/groups`, {
          name: groupName,
          userId: user.id,
        })
        .then((response) => {
          setGroups([...groups, response.data]);
          setSelectedGroupForUpload(response.data._id);
          toast.success("Group created");
          setGroupName("");
        })
        .catch((error) => {
          console.error("Error:", error);
          toast.error("Failed to create group");
        });
    } else {
      toast.error("Please ensure all fields are filled and user is valid");
    }
  };

  const fileInputRef = useRef(null); // Create a reference to the file input
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
      const formattedData = jsonData
        .map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            if (colIndex === 10 && typeof cell === "number") {
              const jsDate = new Date(
                Math.round((cell - 25569) * 86400 * 1000)
              );
              return jsDate.toISOString().split("T")[0];
            }
            return cell;
          })
        )
        .filter((row) => row.some((cell) => cell));

      setUploadedData(formattedData);
      console.log(formattedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSaveUploadedData = () => {
    if (selectedGroupForUpload && uploadedData.length > 1) {
      const headers = uploadedData[0]; // Assuming the first row contains the headers
      const payload = uploadedData.slice(1).map((row) => {
        const studentData = headers.reduce((obj, header, index) => {
          obj[header] = row[index] || ""; // Map headers to corresponding row values
          return obj;
        }, {});
        studentData.group = selectedGroupForUpload; // Add group ID for association
        return studentData;
      });

      console.log("uploaded data", payload);
      axios
        .post(`${apiConfig.baseURL}/api/stud/students/upload`, payload)
        .then(() => {
          toast.success("Uploaded data saved successfully");
          setUploadedData([]); // Clear data after saving
          setFileName(""); // Clear file name
          if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Reset file input
          }
        })
        .catch((error) => {
          console.error("Error saving uploaded data:", error);
          toast.error("Failed to save uploaded data");
        });
    } else {
      toast.error("Please select a group and ensure excel data is uploaded");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-group">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <div className="modal-content">
          <div className="group-creation-section">
            <h2 className="modal-title">Create New Group</h2>
            <label className="modal-label">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="modal-input modal-group-name-input"
            />
            <button
              className="modal-btn btn-create-group"
              onClick={handleGroupCreate}
            >
              Create
            </button>
          </div>

          <div className="excel-uploader">
            <h3 className="modal-section-title">Add Contact</h3>
            <select
              value={selectedGroupForUpload || ""}
              onChange={(e) => setSelectedGroupForUpload(e.target.value)}
              className="modal-select modal-group-select"
            >
              <option value="" disabled>
                Select Group
              </option>
              {groups.map((group) => (
                <option key={group._id} value={group._id}>
                  {group.name}
                </option>
              ))}
            </select>
            <div className="excel-modal-body">
              <h4>Sample excel format</h4>
              <img
                src={sampleexcels}
                alt="Sample Excel Format"
                className="sample-excel-image"
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <a href="/file/democsvfile.csv" download>
                  <button className="modal-btn btn-download-sample">
                    Download Sample csv File
                  </button>
                </a>
                <a href="/file/demoexcelfile.xlsx" download>
                  <button className="modal-btn btn-download-sample">
                    Download Sample xlsx File
                  </button>
                </a>
              </div>
              <h4>Upload excel file</h4>
              <input
                type="file"
                accept=".xlsx, .xls .csv"
                ref={fileInputRef} // Attach the reference to the file input
                onChange={handleFileUpload}
              />
              {fileName && <p>Uploaded File: {fileName}</p>}
              {uploadedData.length > 0 && (
                <button
                  className="excel-modal-view-btn"
                  onClick={() =>
                    document
                      .getElementById("excel-table")
                      .scrollIntoView({ behavior: "smooth" })
                  }
                >
                  Uploaded List
                </button>
              )}
            </div>
            {uploadedData.length > 0 && (
              <div className="excel-table-container">
                <table id="excel-table">
                  <thead>
                    <tr>
                      {uploadedData[0].map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadedData.slice(1).map((row, rowIndex) => (
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
            <button
              className="modal-btn btn-save-uploaded-data"
              onClick={handleSaveUploadedData}
            >
              Save Upload
            </button>
          </div>
        </div>
      </div>
      <ToastContainer
        className="custom-toast"
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={true} // Disable progress bar
        closeOnClick={false}
        closeButton={false}
        pauseOnHover={true}
        draggable={true}
        theme="dark" // Optional: Choose theme ('light', 'dark', 'colored')
      />
    </div>
  );
};
export default GroupModalnew;
