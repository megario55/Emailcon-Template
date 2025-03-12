import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./GroupModal.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import apiConfig from "../apiconfig/apiConfig.js";

const GroupsingleModal = ({ onClose }) => {
  const [manualStudent, setManualStudent] = useState({
    Fname: "",
    Lname: "",
    Email: "",
    EMIamount: "",
    Balance: "",
    Totalfees: "",
    Coursename: "",
    Coursetype: "",
    Offer: "",
    Number: "",
    Date: "",
  });
  const [selectedGroupForManual, setSelectedGroupForManual] = useState(null);
  const [groups, setGroups] = useState([]);
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


  const handleManualStudentSave = () => {
    if (selectedGroupForManual) {
      axios
        .post(`${apiConfig.baseURL}/api/stud/students/manual`, {
          ...manualStudent,
          group: selectedGroupForManual,
        })
        .then(() => {
          toast.success("Manual contact added successfully");
          setManualStudent({
            Fname: "",
            Lname: "",
            Email: "",
            EMIamount: "",
            Balance: "",
            Totalfees: "",
            Coursename: "",
            Coursetype: "",
            Offer: "",
            Number: "",
            Date: "",
          });
        })
        .catch((error) => {
          console.error("Error saving manual Contact:", error);
          toast.error("Failed to save manual Contact");
        });
    } else {
      toast.error("Please fill all fields and select a group");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-group">
        <button className="modal-close-btn" onClick={onClose}>
          &times;
        </button>
        <div className="modal-content">
          <div className="manual-uploader">
            <h2 className="modal-title">Add Single Contact</h2>
            <select
              value={selectedGroupForManual || ""}
              onChange={(e) => setSelectedGroupForManual(e.target.value)}
              className="modal-select modal-group-manual-select"
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
            <label className="modal-label">First Name</label>
            <input
              type="text"
              value={manualStudent.Fname}
              onChange={(e) =>
                setManualStudent({ ...manualStudent, Fname: e.target.value })
              }
              className="modal-input modal-manual-fname-input"
            />
            <label className="modal-label">Last Name</label>
            <input
              type="text"
              value={manualStudent.Lname}
              onChange={(e) =>
                setManualStudent({ ...manualStudent, Lname: e.target.value })
              }
              className="modal-input modal-manual-lname-input"
            />
            <label className="modal-label">Email</label>
            <input
              type="email"
              value={manualStudent.Email}
              onChange={(e) =>
                setManualStudent({ ...manualStudent, Email: e.target.value })
              }
              className="modal-input modal-manual-email-input"
            />
            <label className="modal-label">EMI Amount</label>
            <input
              type="text"
              value={manualStudent.EMIamount}
              onChange={(e) =>
                setManualStudent({
                  ...manualStudent,
                  EMIamount: e.target.value,
                })
              }
              className="modal-input modal-manual-email-input"
            />
            <label className="modal-label">Balance</label>
            <input
              type="text"
              value={manualStudent.Balance}
              onChange={(e) =>
                setManualStudent({ ...manualStudent, Balance: e.target.value })
              }
              className="modal-input modal-manual-email-input"
            />
            <label className="modal-label">TotalFees</label>
            <input
              type="text"
              value={manualStudent.Totalfees}
              onChange={(e) =>
                setManualStudent({
                  ...manualStudent,
                  Totalfees: e.target.value,
                })
              }
              className="modal-input modal-manual-email-input"
            />
            <label className="modal-label">Coursename</label>
            <input
              type="text"
              value={manualStudent.Coursename}
              onChange={(e) =>
                setManualStudent({
                  ...manualStudent,
                  Coursename: e.target.value,
                })
              }
              className="modal-input modal-manual-email-input"
            />
            <label className="modal-label">Coursetype</label>
            <input
              type="text"
              value={manualStudent.Coursetype}
              onChange={(e) =>
                setManualStudent({
                  ...manualStudent,
                  Coursetype: e.target.value,
                })
              }
              className="modal-input modal-manual-email-input"
            />
            <label className="modal-label">Offer</label>
            <input
              type="text"
              value={manualStudent.Offer}
              onChange={(e) =>
                setManualStudent({ ...manualStudent, Offer: e.target.value })
              }
              className="modal-input modal-manual-email-input"
            />
            <label className="modal-label">Number</label>
            <input
              type="text"
              value={manualStudent.Number}
              onChange={(e) =>
                setManualStudent({ ...manualStudent, Number: e.target.value })
              }
              className="modal-input modal-manual-email-input"
            />
            <label className="modal-label">Date</label>
            <input
              type="text"
              value={manualStudent.Date}
              onChange={(e) =>
                setManualStudent({ ...manualStudent, Date: e.target.value })
              }
              className="modal-input modal-manual-email-input"
            />
            <button
              className="modal-btn btn-save-manual-Contact"
              onClick={handleManualStudentSave}
            >
              Save Single Contact
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
export default GroupsingleModal;