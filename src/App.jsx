//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { IoCamera } from "react-icons/io5";
import { IoIosReturnLeft } from "react-icons/io";
import { FaMicrophone } from "react-icons/fa";
import { IoChatbubblesOutline } from "react-icons/io5";
import { MdNavigateBefore } from "react-icons/md";
import { LuMic } from "react-icons/lu";




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
          <button className="go-button" onClick={handleEnter}><IoIosReturnLeft class name="enter-icon" size={30} />
</button>
        ) : (
          <small>I will delete this later but this is our first start that needs to be fix- the button will be disable until user put their loction </small>
        )}
      </div>

      {entered && (
        <div style={{ marginTop: "2rem" }}>
          <button className="go-button" onClick={() => navigate("/camera")}><IoCamera class name="camera-icon" size={30} /></button>
          <button className="go-button" onClick={() => navigate("/mic")}><FaMicrophone class name="mic-icon" size={30} /></button>
          <button className="go-button" onClick={() => navigate("/chat")}><IoChatbubblesOutline class name="chat-icon" size={30} /></button>
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
      <button className="navBack-button" onClick={() => navigate(backTo)}><MdNavigateBefore class name="navBack-icon"  /></button>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// -----------------------------------Camera page-----------------------------------
function Camera() {
  const navigate = useNavigate();
  return (
    <PageShell title="CAMERA PAGE">
      {/* placeholder for your modal trigger */}
      <div role="go-button" data-bs-toggle="modal" data-bs-target="#profilePicModal"></div>
      <div style={{ marginTop: "20rem" }}>
        <button className="camera-button" onClick={() => navigate("/items")}><IoCamera class name="camera-icon" size={30} /></button>
      </div>
    </PageShell>
  );
}

// -----------------------------------Mic page-----------------------------------
function Mic() {
  const navigate = useNavigate();
    const [micOn, setMicOn] = useState(false);

  // When user clicks the mic: it will set micOn to true and navigate to the MIC result page after gtetting the answer from AI => this part need to be implemented later
    const handleMicClick = () => {
    setMicOn(true);

    setTimeout(() => navigate("/resultmic"), 5000); // the time is just fo delaying to navigate to another sub page  --> Insted of 5000 we should get answer from AI and the result will pop up in the actual MIC RESULT PAGE
  } //else {
      // Turning off the mic
     //  setMicOn(false);
      // Todo later:  cancel any recording/request here we add later 
   // }
 // };

  return (
    <PageShell title="MIC PAGE">
      <div className={`mic-visual ${micOn ? "active" : ""}`}> 
        {!micOn && <p className="mic-hint">Tap the mic to start</p>}
        {micOn && ( 
          <div className="square" aria-hidden={!micOn}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <button
          className="mic-button"
          onClick={handleMicClick}
          aria-pressed={micOn}
          aria-label="Start microphone visual"
        >
          <LuMic className="mic-icon" />
        </button>
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
        <button className="go-button" onClick={() => navigate("/resultmic")}>click me</button>
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
    <PageShell title="sRESULT PAGE">
      <h3>Berkeley</h3>
      <div style={{ marginTop: "20rem" }}>
        <button className="go-button" onClick={() => navigate("/recenter")}>
          Recycling Center
        </button>
      </div>
    </PageShell>
  );
}


// -----------------------------------MIC Result page-----------------------------------

function Resultmic() {
  const navigate = useNavigate();
  return (
    <PageShell title="MIC RESULT PAGE">
      <h3>Berkeley</h3>
      <div style={{ marginTop: "20rem" }}>
        <button className="go-button" onClick={() => navigate("/recenter")}>
          Recycling Center
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
      <Route path="/resultmic" element={<Resultmic />} />
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
