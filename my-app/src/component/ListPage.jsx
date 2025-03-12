import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ListPage.css";
import { FiEdit, FiTrash2, FiRefreshCw } from 'react-icons/fi'; // Importing icons
import apiConfig from "../apiconfig/apiConfig";




const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-confirm">
        <p>{message}</p>
        <div className="confirm">
        <button className="editbtn" onClick={onConfirm}>
          Yes
        </button>
        <button className="cancelbtn" onClick={onClose}>
          No
        </button>
        </div>
      </div>
    </div>
  );
};


const ListPage = ({ onClose }) => {
 const [activeTab, setActiveTab] = useState("groups");
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(groups.length > 0 ? groups[0]._id : "");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editFormData, setEditFormData] = useState({
    Fname: "",
    Lname: "",
    Email: "",
    EMIamount: "",
    Balance:"",
    Totalfees:"",
    Coursename:"",
    Coursetype:"",
    Offer:"",
    Number:"",
    Date:"",
    group: "",
  });
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [showDeletingToast, setShowDeletingToast] = useState(false);
  const [showEditingToast, setShowEditingToast] = useState(false);


  const user = JSON.parse(localStorage.getItem("user"));

 useEffect(() => {
    // If there's no selected group or if students are empty, we should set to the first group
    if (!selectedGroup && groups.length > 0) {
      setSelectedGroup(groups[0]._id); // Set the first group's id as the default
    }
  }, [groups, selectedGroup]); // Re-run this effect if groups or selectedGroup change


useEffect(() => {
 const fetchGroupsAndStudents = () => {
  axios.get(`${apiConfig.baseURL}/api/stud/groups/${user.id}`)
    .then((response) => setGroups(response.data))
    .catch((err) => console.log(err));

  axios.get(`${apiConfig.baseURL}/api/stud/students`)
    .then((response) => {
      setStudents(response.data);
    })
    .catch((err) => console.log(err));
};
fetchGroupsAndStudents();
}, [user]);


  const handleRefresh = () => {
  axios.get(`${apiConfig.baseURL}/api/stud/groups/${user.id}`)
    .then((response) => setGroups(response.data))
    .catch((err) => console.log(err));

  axios.get(`${apiConfig.baseURL}/api/stud/students`)
    .then((response) => {
      setStudents(response.data);
    })
    .catch((err) => console.log(err));
};
  
  // Delete a group
   const handleDeleteGroup = (groupId) => {
    setGroupToDelete(groupId);
    setIsModalOpen(true);
  };

  const confirmDeleteGroup = () => {
    if (groupToDelete) {
      axios
        .delete(`${apiConfig.baseURL}/api/stud/groups/${groupToDelete}`)
        .then(() => {
          setGroups(groups.filter((group) => group._id !== groupToDelete));
          toast.success("Group and its students deleted");
        })
        .catch((err) => {
          console.error(err);
          toast.error("Failed to delete group");
        })
        .finally(() => {
          setIsModalOpen(false);
          setGroupToDelete(null);
        });
    }
  };
  // Delete selected students
 const handleDeleteSelectedStudents = () => {
  if (selectedStudents.length === 0) {
    toast.error("Please select contacts to delete.");
    return;
  }
  
  setShowDeletingToast(true); // Show toast
  axios
    .delete(`${apiConfig.baseURL}/api/stud/students`, {
      data: { studentIds: selectedStudents },
    })
    .then(() => {
      setStudents(
        students.filter((student) => !selectedStudents.includes(student._id))
      );
      setSelectedStudents([]);
      setTimeout(() => {
        toast.success("Selected contacts deleted!");
      }, 500);
    })
    .catch(() => {
      toast.error("Failed to delete contacts");
    })
    .finally(() => {
      setShowDeletingToast(false); // Hide toast
    });
};


  // Edit group name
  const handleEditGroupName = (group) => {
    setEditingGroup(group);
    setGroupName(group.name);
  };

  const handleSaveGroupName = () => {
    if (groupName.trim()) {
      axios
        .put(`${apiConfig.baseURL}/api/stud/groups/${editingGroup._id}`, {
          name: groupName,
        })
        .then(() => {
          setGroups(
            groups.map((group) =>
              group._id === editingGroup._id
                ? { ...group, name: groupName }
                : group
            )
          );
          setEditingGroup(null);
          setGroupName("");
          toast.success("Group name updated successfully!");
        })
        .catch((err) => toast.error("Failed to update group name"));
    }
  };

  // Edit student details
const handleEditStudent = (student) => {
    toast.success("Edit contact detail in bottom of tab");
    console.log(student); // Debug log
    setEditingStudent(student);
    setEditFormData({
        Fname: student.Fname,
        Lname:student.Lname,
        Email: student.Email,
        EMIamount:student.EMIamount,
        Balance:student.Balance,
        Totalfees:student.Totalfees,
        Coursename:student.Coursename,
        Coursetype:student.Coursetype,
        Offer:student.Offer,
        Number:student.Number,
        Date:student.Date,
        group: student.group?._id || "",
    });
};

const handleSaveStudent = () => {
  if (editFormData.Fname.trim() && editFormData.Lname.trim() && editFormData.Email.trim() && editFormData.Coursename.trim() && editFormData.Coursetype.trim() && editFormData.Date.trim() && editFormData.group) {
     setShowEditingToast(true); // Show toast
    axios.put(`${apiConfig.baseURL}/api/stud/students/${editingStudent._id}`, {
        Fname: editFormData.Fname,
        Lname: editFormData.Lname,
        Email: editFormData.Email,
        EMIamount: editFormData.EMIamount,
        Balance: editFormData.Balance,
        Totalfees: editFormData.Totalfees,
        Coursename: editFormData.Coursename,
        Coursetype: editFormData.Coursetype,
        Offer: editFormData.Offer,
        Number: editFormData.Number,    
        Date: editFormData.Date,
        group: editFormData.group, // Send only the group ID here
      })
      .then((response) => {
        const updatedStudent = response.data;

        // Update the students list with the updated student data
        setStudents(
          students.map((student) =>
            student._id === updatedStudent._id ? updatedStudent : student
          )
        );

        setEditingStudent(null); // Close the edit form
        toast.success("Details updated successfully!");
      })
      .catch((err) => {
        console.error("Error updating student:", err);
        toast.error("Failed to update student");
      })
       .finally(() => {
      setShowEditingToast(false); // Hide toast
      });
      
  } else {
    toast.error("All fields are required");
  }
};

  const filteredStudents = selectedGroup
    ? students.filter(
        (student) => student.group && student.group._id === selectedGroup
      )
    : [];


  return (
    <div className="modal-overlay">
      <div className="modal-content modal-content-list">
        <button className="close-btn" onClick={onClose}>
          &times;
        </button>
        <h2>List Contacts</h2>
        <div className="btn-tabs">
          <button
            className={`btn ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => setActiveTab("groups")}
          >
            Groups
          </button>
          <button
            className={`btn ${activeTab === "students" ? "active" : ""}`}
            onClick={() => setActiveTab("students")}
          >
            Contacts
          </button>
        </div>

       {activeTab === "groups" && (
  <div>
    <h3>Groups</h3>
    {groups.length === 0 ? (
      <p>No groups available</p>
    ) : (
      <div className="student-list">
      <table>
        <thead>
          <tr>
            <th>Group Name</th>
            <th>Action</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group._id}>
              <td>{group.name}</td>
              <td>
                <button
                  className="delstudent"
                  onClick={() => handleEditGroupName(group)}
                >
                  <FiEdit size={18} color="green" />
                </button>
                <button
                  className="delstudent"
                  onClick={() => handleDeleteGroup(group._id)}
                >
                  <FiTrash2 size={18} color="red" />
                </button>
              </td>
              <td><button
                     className={`view-btn btn ${activeTab === "students" ? "active" : ""}`}
                     onClick={() => setActiveTab("students")}
                >View
                </button></td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    )}
 
              {editingGroup && (
          <div className="edit-modal">
            <h3>Edit Group</h3>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
            <button className="editbtn" onClick={handleSaveGroupName}>Save</button>
            <button className="cancelbtn" onClick={() => setEditingGroup(null)}>Cancel</button>
          </div>
        )}
          </div>
        )}

        {activeTab === "students" && (
          <div>
            <h3>Contacts</h3>
            <div>
              <label>Filter by Group:</label>
              <select
                value={selectedGroup || ""}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                {/* <option value="">All</option> */}
                {groups.map((group) => (
                  <option key={group._id} value={group._id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          {filteredStudents.length === 0 ? (
              <p>No Contacts available</p>
            ) : (
              <>
                <button className="btn" onClick={handleDeleteSelectedStudents}>
                  Delete Selected Contacts
                </button>
                 <button className="btn-ref" onClick={handleRefresh}>
                   <FiRefreshCw/>  Refresh
                </button>
                <div className="student-list">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) =>
                        setSelectedStudents(
                          e.target.checked
                            ? filteredStudents.map((s) => s._id)
                            : []
                        )
                      }
                    />
                  </th>
                  <th>Fname</th>
                  <th>Lname</th>
                  <th>Email</th>
                  <th>EMIamount</th>
                  <th>Balance</th>
                  <th>Totalfees</th>
                  <th>Coursename</th>
                  <th>Coursetype</th>
                  <th>Offer</th>
                  <th>Number</th>
                  <th>Date</th>
                  <th>Group</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student._id)}
                        onChange={(e) =>
                          setSelectedStudents((prev) =>
                            e.target.checked
                              ? [...prev, student._id]
                              : prev.filter((id) => id !== student._id)
                          )
                        }
                      />
                    </td>
                    <td>{student.Fname || "Nil"}</td>
                    <td>{student.Lname || "Nil"}</td>
                    <td>{student.Email || "Nil"}</td>
                    <td>{student.EMIamount || "Nil"}</td>
                    <td>{student.Balance || "Nil"}</td>
                    <td>{student.Totalfees || "Nil"}</td>
                    <td>{student.Coursename || "Nil"}</td>
                    <td>{student.Coursetype || "Nil"}</td>
                    <td>{student.Offer || "Nil"}</td>
                    <td>{student.Number || "Nil"}</td>
                    <td>{student.Date || "Nil"}</td>

                    <td>{student.group?.name || "No group"}</td>
                    <td>
                      <button className="editstudent"
                        onClick={() => handleEditStudent(student)}>
                  <FiEdit size={18} color="green"/>
                      </button>
                       <button className="delstudent"
                        onClick={handleDeleteSelectedStudents}
                      >
                              <FiTrash2 size={18} color="red"/>
                      </button>
                       
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
              </>
            )}

                 {editingStudent && (
          <div className="edit-modal">
            <h3>Edit Student</h3>
          <form
  onSubmit={(e) => {
    e.preventDefault();
    handleSaveStudent(); // Save the student when the form is submitted
  }}
>
  <input
    type="text"
    name="Fname"
    value={editFormData.Fname}
    onChange={(e) =>
      setEditFormData({ ...editFormData, Fname: e.target.value })
    }
    placeholder="Enter Fname"
  />
   <input
    type="text"
    name="Lname"
    value={editFormData.Lname}
    onChange={(e) =>
      setEditFormData({ ...editFormData, Lname: e.target.value })
    }
    placeholder="Enter Lname"
  />
  
  <input
    type="email"
    name="Email"
    value={editFormData.Email}
    onChange={(e) =>
      setEditFormData({ ...editFormData, Email: e.target.value })
    }
    placeholder="Enter Email"
  />
   <input
    type="text"
    name="EMIamount"
    value={editFormData.EMIamount}
    onChange={(e) =>
      setEditFormData({ ...editFormData, EMIamount: e.target.value })
    }
    placeholder="Enter EMIamount"
  />
   <input
    type="text"
    name="Balance"
    value={editFormData.Balance}
    onChange={(e) =>
      setEditFormData({ ...editFormData, Balance: e.target.value })
    }
    placeholder="Enter Balance"
  />
   <input
    type="text"
    name="Totalfees"
    value={editFormData.Totalfees}
    onChange={(e) =>
      setEditFormData({ ...editFormData, Totalfees: e.target.value })
    }
    placeholder="Enter Totalfees"
  />
   <input
    type="text"
    name="Coursename"
    value={editFormData.Coursename}
    onChange={(e) =>
      setEditFormData({ ...editFormData, Coursename: e.target.value })
    }
    placeholder="Enter Coursename"
  />
  <input
    type="text"
    name="Coursetype"
    value={editFormData.Coursetype}
    onChange={(e) =>
      setEditFormData({ ...editFormData,Coursetype: e.target.value })
    }
    placeholder="Enter Coursetype"
  />
  <input
    type="text"
    name="Offer"
    value={editFormData.Offer}
    onChange={(e) =>
      setEditFormData({ ...editFormData, Offer: e.target.value })
    }
    placeholder="Enter offer"
  />
  <input
    type="text"
    name="Number"
    value={editFormData.Number}
    onChange={(e) =>
      setEditFormData({ ...editFormData, Number: e.target.value })
    }
    placeholder="Enter Number"
  />
  <input
    type="text"
    name="Date"
    value={editFormData.Date}
    onChange={(e) =>
      setEditFormData({ ...editFormData, Date: e.target.value })
    }
    placeholder="Enter Date"
  />


  {/* Group Dropdown */}
  <select
    name="group"
    value={editFormData.group?._id || ""}
    onChange={(e) => {
      const selectedGroup = groups.find(
        (group) => group._id === e.target.value
      );
      setEditFormData({ ...editFormData, group: selectedGroup || null });
    }}
  >
    <option value="">Select Group</option>
    {groups.map((group) => (
      <option key={group._id} value={group._id}>
        {group.name}
      </option>
    ))}
  </select>

  {/* Save Button */}
  <button className="editbtn" type="submit">
    Save
  </button>

  {/* Cancel Button */}
  <button
    className="cancelbtn"
    type="button"
    onClick={() => setEditingStudent(null)} // Close the edit form
  >
    Cancel
  </button>
</form>

          </div>
        )}

      
          </div>
        )}

  
          {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDeleteGroup}
          message="Are you sure you want to delete this group?"
        />

        
        {/* deleting modal */}
        {showDeletingToast && (
   <div className="deleting-toast">
    Deleting selected contacts, please wait...
   </div>
)}
 {/* editing modal */}
        {showEditingToast && (
   <div className="deleting-toast">
       Updated please wait...
   </div>
)}
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
    </div>
  );
};

export default ListPage;
