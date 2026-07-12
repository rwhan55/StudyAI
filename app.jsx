import React, { useEffect, useRef, useState } from "react";
import "./App.css";

import {
  FaRobot,
  FaUser,
  FaPaperPlane,
  FaTrash,
  FaFilePdf,
  FaCloudUploadAlt,
  FaCopy,
  FaCheck,
} from "react-icons/fa";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Welcome to StudyAI.\nUpload your PDFs and ask me anything about them.",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "👋 Welcome to StudyAI.\nUpload your PDFs and ask me anything about them.",
      },
    ]);
  };

  const copyText = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);

      setTimeout(() => {
        setCopiedIndex(null);
      }, 1800);
    } catch (err) {
      console.log(err);
    }
  };

  const uploadPDF = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.message ||
            data.status ||
            "✅ PDF uploaded successfully.",
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Failed to upload PDF.",
        },
      ]);
    }

    setUploading(false);
  };

  const askAI = async () => {
    if (!question.trim() || loading) return;

    const userQuestion = question.trim();

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: userQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userQuestion,
        }),
      });

      const data = await res.json();

      const answer =
        data.answer ||
        data.response ||
        data.result ||
        "No response received.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "❌ Unable to connect with backend.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askAI();
    }
  };

  return (
    <div className="app">

      {/* Sidebar */}

      <aside className="sidebar">

        <div className="logo">
          <FaRobot />
          <span>StudyAI</span>
        </div>

        <button
          className="uploadBtn"
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
        >
          <FaCloudUploadAlt />
          {uploading ? "Uploading..." : "Upload PDF"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          hidden
          onChange={(e) => uploadPDF(e.target.files[0])}
        />

        <button className="clearBtn" onClick={clearChat}>
          <FaTrash />
          Clear Chat
        </button>

        <div className="sidebarBottom">
          <FaFilePdf className="pdfIcon" />
          <p>Upload notes, books or assignments and chat with your PDFs.</p>
        </div>

      </aside>

      {/* Main */}

      <main className="main">

        <header className="topBar">
          <h2>StudyAI Assistant</h2>
          <p>Powered by FastAPI + RAG + Llama</p>
        </header>

        <div className="chatArea">

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`message ${msg.role}`}
            >

              <div className="avatar">
                {msg.role === "assistant" ? (
                  <FaRobot />
                ) : (
                  <FaUser />
                )}
              </div>

              <div className="bubble">

                <div className="messageText">
                  {msg.content}
                </div>

                {msg.role === "assistant" && (
                  <button
                    className="copyBtn"
                    onClick={() => copyText(msg.content, index)}
                  >
                    {copiedIndex === index ? (
                      <>
                        <FaCheck />
                        Copied
                      </>
                    ) : (
                      <>
                        <FaCopy />
                        Copy
                      </>
                    )}
                  </button>
                )}

              </div>

            </div>

          ))}

          {loading && (
            <div className="message assistant">

              <div className="avatar">
                <FaRobot />
              </div>

              <div className="bubble">

                <div className="typingLoader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>

            </div>
          )}

          <div ref={chatEndRef}></div>

        </div>

        <div className="inputSection">

          <textarea
            value={question}
            placeholder="Ask anything about your uploaded PDF..."
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />

          <button
            className="sendBtn"
            onClick={askAI}
            disabled={loading}
          >
            <FaPaperPlane />
          </button>

        </div>

      </main>

    </div>
  );
}

export default App;
