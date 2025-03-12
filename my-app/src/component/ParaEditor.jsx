import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Editor } from "@tinymce/tinymce-react";
import "./ParaEditor.css";
import { Send, Loader2, Clipboard } from "lucide-react";
import aiicon from "../Images/google-gemini-icon.png";

const ParaEditor = ({ isOpen, content, onSave, onClose }) => {
  const [editorContent, setEditorContent] = useState(content);
  const [aiInput, setAiInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [chatbotVisible, setChatbotVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const editorRef = useRef(null);

  const geminiApiKey = "AIzaSyAeEYvm6VysJ5mDEnx9-nY-ukIIqtetUNc";
  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const handleInsertVariable = (value) => {
    if (editorRef.current?.editor) {
      const editor = editorRef.current.editor;
      editor.focus();
      editor.selection.setContent(value);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(aiResponse).then(() => {
      setTooltipVisible(true);
      setTimeout(() => setTooltipVisible(false), 2000);
    }).catch((err) => console.error("Copy failed", err));
  };

  const handleGenerateAIContent = async () => {
    if (!aiInput.trim()) return;
    setIsLoading(true);

    try {
      const result = await model.generateContent(aiInput);
      const res = await result.response.text();
      setAiResponse(res || "AI content could not be generated.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiResponse("Failed to generate AI content.");
    }

    setIsLoading(false);
  };

  const handleOpenChatbot = () => {
    setChatbotVisible(!chatbotVisible);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-para">
      <div className="modal-content-para">
        <Editor
          apiKey="hddpazfss5mb3ppinipav37ap1zt3pqs9oz3c897fidqfddq"
          value={editorContent}
          onEditorChange={(newContent) => setEditorContent(newContent)}
          onInit={(evt, editor) => (editorRef.current = { editor })}
          init={{
            menubar: true,
            branding: false,
            plugins: ["lists", "link", "textcolor", "colorpicker", "code"],
            toolbar: `undo redo | bold italic underline | fontselect fontsize | 
                      alignleft aligncenter alignright | bullist numlist | forecolor backcolor | code`,
            forced_root_block: "",
            content_style: "white-space: pre-wrap;",
          }}
        />

        <div className="button-group">
          <button className="para-btn" onClick={() => onSave(editorContent)}>Save</button>
          <button className="para-btn" onClick={onClose}>Cancel</button>

          <select onChange={(e) => handleInsertVariable(e.target.value)} className="select-variable-para">
            <option value="" disabled selected>Add Variable</option>
            <option value="{Fname}">First Name</option>
            <option value="{Lname}">Last Name</option>
            <option value="{Email}">Email</option>
            <option value="{EMIamount}">EMI Amount</option>
            <option value="{Balance}">Balance</option>
            <option value="{Totalfees}">Total Fees</option>
            <option value="{Coursename}">Course Name</option>
            <option value="{Coursetype}">Course Type</option>
            <option value="{Offer}">Offer</option>
            <option value="{Number}">Number</option>
            <option value="{Date}">Date</option>
            <option value="{College}">College</option>
          </select>

      <button className="ai-btn" onClick={handleOpenChatbot}>
           <img src={aiicon} alt="Gemini AI" className="gemini-icon" />
      </button>
        </div>

        {/* Animated AI Chatbot */}
        {chatbotVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="chatbot-container"
          >
            <div className="chatbot-header">
              <span>AI Chatbot</span>
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                className="close-btn-chat"
                onClick={handleOpenChatbot}
              >
                X
              </motion.button>
            </div>

            <div className="chatbot-body">
              <div className="chatbot-response" style={{ maxHeight: "150px", overflowY: "auto" }}>
                {aiResponse && (
                  <>
                    <div className="copy-container">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="copy-btn-chat"
                        onClick={handleCopyResponse}
                      >
                        <Clipboard /> Copy
                      </motion.button>
                      {tooltipVisible && <span className="tooltip">Copied!</span>}
                    </div>
                    <pre>{aiResponse}</pre>
                  </>
                )}
              </div>

              <input
                type="text"
                className="ai-input"
                placeholder="Ask AI to generate content..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
              />
              
              {/* Animated Send Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="send-btn-chat"
                onClick={handleGenerateAIContent}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="spinner animate-spin" /> : <Send />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ParaEditor;
