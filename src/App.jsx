//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
//import './App.css'
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
// src/App.jsx
import React, { useRef, useState, useEffect } from "react";

//
function Home() {
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);
  const [zip, setZip] = useState("");
  const [saveZip, setSaveZip] = useState(false);

  const handleEnter = () => {
    if (saveZip && zip.trim()) {
      localStorage.setItem("savedLocation", zip.trim());
    }
    setEntered(true); // unlock the buttons
  };

  return (
    <div className="container">
      <h1>Go Green</h1>
      <h3>Berkeley</h3>
      <h4>Please type or tap the map button to share your location</h4>
    
      <div>
        <input
          type="text" id="inputzip" placeholder="Zipcode / City" 
          className="inputzip" value={zip} onChange={(e) => setZip(e.target.value)}
        />
      </div>

      <div>
        <input
          type="checkbox"
          id="zipcheckbox"
          checked={saveZip}
          onChange={(e) => setSaveZip(e.target.checked)}
        />
        <label htmlFor="zipcheckbox">Save this location</label>
      </div>

      <div style={{ maxWidth: "200px", margin: "2rem auto" }}>
        {!entered ? (
          <button className="go-button" onClick={handleEnter}>Enter</button>
        ) : (
          <small>I will delete this later but this is our first start that needs to be fix- the button will be disable until user put their loction </small>
        )}
      </div>

      {entered && (
        <div style={{ marginTop: "5rem" }}>
          <button className="go-button" onClick={() => navigate("/camera")}>Camera</button>
          <button className="go-button" onClick={() => navigate("/mic")}>Mic</button>
          <button className="go-button" onClick={() => navigate("/chat")}>Chat</button>
        </div>
      )}
    </div>
  );
}

// -----------------------------------PageShell component-----------------------------------
function PageShell({ title, children, backTo = "/" }) {
  const navigate = useNavigate();
  return (
    <div className="container">
      <button className="go-button" onClick={() => navigate(backTo)}>Back</button>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// -----------------------------------Camera page-----------------------------------


function Camera() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);

  useEffect(() => {
    async function getVideo() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert("Could not access camera: " + err.message);
      }
    }
    getVideo();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageDataUrl = canvas.toDataURL("image/png");
    setCapturedPhoto(imageDataUrl);
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  return (
    <div className="container">
      <button className="go-button" onClick={() => navigate("/")}>Back</button>
      <h2>Camera Page</h2>

      {!capturedPhoto ? (
        <>
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxWidth: 400 }} />
          <button className="go-button" onClick={handleCapture} style={{ marginTop: "1rem" }}>
            Capture
          </button>
        </>
      ) : (
        <>
          <img src={capturedPhoto} alt="Captured" style={{ width: "100%", maxWidth: 400 }} />
          <div style={{ marginTop: "1rem" }}>
            <button className="go-button" onClick={handleRetake}>Retake</button>
            <button
              className="go-button"
              onClick={() => navigate("/items")}
              style={{ marginLeft: "1rem" }}
            >
              Continue
            </button>
          </div>
        </>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}


// -----------------------------------Mic page-----------------------------------
function MicModal({ isOpen, onClose }) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    // Cleanup audio URL on modal close
    if (!isOpen) {
      setAudioURL(null);
      setRecording(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      alert("Error accessing microphone: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div style={{
        background: "white", padding: 20, borderRadius: 8,
        maxWidth: 400, width: "90%", textAlign: "center",
      }}>
        <h3>Mic Recorder</h3>
        {!recording ? (
          <button className="go-button" onClick={startRecording}>Start Recording</button>
        ) : (
          <button className="go-button" onClick={stopRecording}>Stop Recording</button>
        )}

        {audioURL && (
          <div style={{ marginTop: 20 }}>
            <audio controls src={audioURL} />
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button className="go-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function Mic() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <PageShell title="MIC PAGE">
      <button className="go-button" onClick={() => setModalOpen(true)}>Tap to Speak</button>

      <MicModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <div style={{ marginTop: "20rem" }}>
        <button className="go-button" onClick={() => navigate("/result")}>Next</button>
      </div>
    </PageShell>
  );
}


// -----------------------------------Chat page-----------------------------------
function Chat() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  return (
    <PageShell title="CHAT PAGE">
      <div>
        <input
          type="text"
          id="chat-input"
          placeholder="What recycling question do you have?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div style={{ marginTop: "20rem" }}>
        <button className="go-button" onClick={() => navigate("/result")}>click me</button>
      </div>
    </PageShell>
  );
}

// -----------------------------------Items page-----------------------------------
function Items() {
  const navigate = useNavigate();
  const go = () => navigate("/result");
  return (
    <PageShell title="CATEGORY PAGE">
      <div style={{ marginTop: "1rem" }}>
        <button className="go-button" onClick={go}>Paper</button>
        <button className="go-button" onClick={go}>Clean Plastic</button>
        <button className="go-button" onClick={go}>Metal</button>
        <button className="go-button" onClick={go}>Glass</button>
        <button className="go-button" onClick={go}>Elec-Waste</button>
        <button className="go-button" onClick={go}>Trash</button>
        <button className="go-button" onClick={go}>Don't Know</button>
      </div>
    </PageShell>
  );
}
  // -----------------------------------Result page-----------------------------------
function Result() {
  const navigate = useNavigate();
  return (
    <PageShell title="RESULT PAGE">
      <h3>Berkeley</h3>
      <div style={{ marginTop: "20rem" }}>
        <button className="go-button" onClick={() => navigate("/recenter")}>
          Recycling Center Near Me
        </button>
      </div>
    </PageShell>
  );
}
// -----------------------------------Recenter page-----------------------------------
function Recenter() {
  const navigate = useNavigate();
  return (
    <PageShell title="CENTER MAP PAGE">
      <div style={{ marginTop: "20rem" }}>
        <button className="go-button" onClick={() => navigate("/")}>Home</button>
      </div>
    </PageShell>
  );
}


// -----------------------------------Stubs for Recycling Pages-----------------------------------
// we will use these pages for better navigation

const Compost = () => <PageShell title="COMPOST PAGE" />;
const Paper = () => <PageShell title="MIXED PAPER PAGE" />;
const CleanPlastic = () => <PageShell title="CLEAN PLASTIC PAGE" />;
const Landfill = () => <PageShell title="LANDFILL PAGE" />;
const Electronic = () => <PageShell title="ELECTRONIC PAGE" />;

// ---- Our Router ----
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/camera" element={<Camera />} />
      <Route path="/mic" element={<Mic />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/items" element={<Items />} />
      <Route path="/result" element={<Result />} />
      <Route path="/recenter" element={<Recenter />} />
      <Route path="/compost" element={<Compost />} />
      <Route path="/paper" element={<Paper />} />
      <Route path="/clean-plastic" element={<CleanPlastic />} />
      <Route path="/landfill" element={<Landfill />} />
      <Route path="/electronic" element={<Electronic />} />
// ---- Our 404 Page ----
      <Route path="*" element={<div className="container">
        <h2>ERROR: Page not found</h2></div>} />
    </Routes>
  );
}
