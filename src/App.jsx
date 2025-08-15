import React, { useRef, useState, useEffect, useCallback } from "react";
import {Routes, Route, useNavigate, useLocation} from "react-router-dom";
import {IoCamera, IoChatbubblesOutline, IoRadioButtonOn} from "react-icons/io5";
import { IoIosReturnLeft, IoIosReverseCamera, IoIosMic } from "react-icons/io";
import { FaMicrophone, FaMapMarkerAlt, FaRecycle } from "react-icons/fa";
import { MdNavigateBefore, MdOutlineDriveFolderUpload } from "react-icons/md";
import { LuMic } from "react-icons/lu";
import { IoHomeOutline } from "react-icons/io5";
import './App.css';


function Home() {
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);
  const [zip, setZip] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const isAllowedLocation = (cityStateString) => {
    const normalized = (cityStateString || "").toLowerCase();
    return normalized.includes("berkeley") || normalized.includes("san francisco");
  };

  useEffect(() => {
    const savedZip = localStorage.getItem("savedLocation");
    if (savedZip) {
      setZip(savedZip);
    }
  }, []);

  const getCityStateFromZipcode = async (zipcode) => {
    const response = await fetch(
      'https://noggin.rea.gent/elaborate-monkey-7948',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer rg_v1_v1sngmgw1epn6hi6d7syr2qwxcsof6mplcek_ngk',
        },
        body: JSON.stringify({
          "zipcode": zipcode,
        }),
      }
    );
    
    const cityState = await response.text();
    if (!isAllowedLocation(cityState)) {
      throw new Error("ERROR. Allowed: San Francisco or Berkeley.");
    }
    localStorage.setItem("userLocation", cityState);
    if (zipcode) {
      localStorage.setItem("savedLocation", zipcode);
    }
    return cityState;
  };

  const getLocationAndZipcode = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
          );
          const data = await response.json();
          const zipcode = data.address?.postcode;
          if (zipcode) {
            setZip(zipcode);
            await getCityStateFromZipcode(zipcode);
          }
        } catch {
          alert("Location not supported! This app currently supports only San Francisco and Berkeley zip code.");
        }
      }
    );
  };


  const handleEnter = async () => {
    if (!zip.trim()) return;
    
    setIsVerifying(true);
    try {
      await getCityStateFromZipcode(zip.trim());
      setEntered(true); // uwe are unlocking the buttons only after  verification
    } catch {
      alert("Location not supported! This app currently supports only San Francisco and Berkeley zip code.");
    } finally {
      setIsVerifying(false);
    }
  };
  return (
    <div className="container" >
      <h1 className='title'>Go Green</h1>

      {localStorage.getItem("userLocation") && <h3>{localStorage.getItem("userLocation")}</h3>}
      
      {!localStorage.getItem("userLocation") && <h4>Please type your zip code or allow location access.</h4>}
   
     
      <div style={{ marginTop: "3rem" }}>
        <button type="button"
          className="location-button small-text-btn " 
          onClick={getLocationAndZipcode}
        >
         <FaMapMarkerAlt className="findlocation-icon" size={20} /> <span></span> Find</button>
      </div>

    <label htmlFor="inputzip">Enter Zipcode or City:</label>
      <div style={{ marginTop: "-1rem" }}>
        <input
          type="text" id="inputzip" placeholder="Zipcode / City" required minLength={4} maxLength={101}
          className="inputzip" value={zip} onChange={(e) => {
            setZip(e.target.value);
            setNeedsVerification(true);
            setEntered(false); 
          }}
        /> 
      </div>

   
      <div style={{ marginTop: "1.5rem" }}>
        
            <button
              className="enter-button"
              onClick={async () => {
                if (!zip.trim()) return;
                
                setIsVerifying(true);
                try {
                  await getCityStateFromZipcode(zip.trim());
                  setNeedsVerification(false);
                } catch {
                  alert("Location not supported! This app currently supports only San Francisco and Berkeley zip code.");
                } finally {
                  setIsVerifying(false);
                }
              }}
              disabled={!zip.trim() || isVerifying}
              style={{
                fontSize: "0.9rem",
                padding: "0.5rem 1rem",
                minWidth: "auto"
              }}
            >
              {isVerifying ? "Verifying..." : "Update Location"}
            </button>
          </div>   
      <h5>Location required to continue</h5>
      <div style={{ maxWidth: "200px", margin: "0rem auto" }}>
        {!entered ? (
          <button 
            className="go-button" 
            onClick={handleEnter}
            disabled={isVerifying || !localStorage.getItem("userLocation") || zip.length < 5 || needsVerification}
          >
            {isVerifying ? "Verifying..." : <IoIosReturnLeft className="enter-icon" size={30} />}
          </button>
        ) : (
          <small>You can click on any of these button to get help </small>
        )}
      </div>

      {entered && (
        <div style={{ marginTop: "2rem" }}>
          <button className="go-button" onClick={() => navigate("/camera")}><IoCamera class name="camera-icon" size={30} /></button>
          <button className="go-button" onClick={() => navigate("/chat")}><IoChatbubblesOutline class name="chat-icon" size={30} /></button>
        </div>  
      )}
    </div>
  );
}

// -----------------------------------PageShell component-----------------------------------
function PageShell({ title, children, backTo = "/" }) {
  const navigate = useNavigate();
  const userLocation = localStorage.getItem("userLocation") || "";
  
  const handleBackClick = () => {
    if (backTo === -1) {
      navigate(-1);
    } else {
      navigate(backTo);
    }
  };
  return (
    <div className="container">
      <button className="navBack-button " onClick={handleBackClick}><MdNavigateBefore className="navBack-icon"  /></button>
      {userLocation && <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>{userLocation}</h3>}
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
  const fileInputRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      alert("not able to accses camera");
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    startCamera();

    return () => {
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject;
        stream.getTracks().forEach((track) => track.stop());
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

    if (video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
    }
  };
  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();  
  };
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedPhoto(e.target.result);
        if (videoRef.current && videoRef.current.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert("select a valid image file.");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="container">
      <button className="navBack-button " onClick={() => navigate("/")}><MdNavigateBefore class name="navBack-icon"  /></button>
      <h2>Camera Page</h2>

      {!capturedPhoto ? (
        <>
          <video className="camera-frame" ref={videoRef} autoPlay playsInline />
          <div style={{ marginTop: "1rem", textAlign: "center" }}>
            <button className="capture-button" onClick={handleCapture}>
              <IoRadioButtonOn className="capture-icon" size={50}/>
            </button>
            <div style={{ marginTop: "1rem" }}>
              <button className="go-button" onClick={handleUploadClick}>
                 <MdOutlineDriveFolderUpload className="upload-icon" size={30}  />
              </button>
            </div>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            style={{ display: "none" }}
          />
        </>
      ) : (
        <>
          <img  className="camera-frame" src={capturedPhoto} alt="Captured" style={{ width: "100%", maxWidth: 400 }} />
          
          <p style={{ marginTop: "1rem" }}>Photo captured successfully!</p>
          
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <div style={{ marginTop: "1rem" }}>
              <button className="camera-button" onClick={handleRetake}>
                <IoIosReverseCamera className="retake-icon" size={30} />
              </button>
              <button className="go-button" onClick={handleUploadClick}>
               <MdOutlineDriveFolderUpload className="upload-icon" size={30}  />

              </button>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <button className="Continue-button" onClick={() => navigate("/resultcamera", { state: { photo: capturedPhoto, userLocation: localStorage.getItem("userLocation"), zipcode: localStorage.getItem("savedLocation") } })}>
                Continue
              </button>
            </div>
          </div>
        </>
      )}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

// -----------------------------------CAMERA RESULT PAGE-----------------------------------
function Resultcamera() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [analysisError, setAnalysisError] = useState("");
  const [photo, setPhoto] = useState(null);

  const analyzePhoto = useCallback(async (imageDataUrl) => {
    setIsAnalyzing(true);
    setAnalysisError("");
    
    try {
      const zipcode = localStorage.getItem("savedLocation") || "";
      const response = await fetch(
        'https://noggin.rea.gent/constitutional-anglerfish-9162',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer rg_v1_ld2m3dyau47sk71gaed1xy99nk6opufcih7v_ngk',
          },
          body: JSON.stringify({
            "user_item": imageDataUrl,
            "zipcode": zipcode,
          }),
        }
      );
      
      const result = await response.text();
      
      let formattedResult = result;
      try {
        const parsedResult = JSON.parse(result);
        formattedResult = formatApiResponse(parsedResult);
      }catch (parseError) {
      console.warn(" parse failed:", parseError);
      formattedResult = result;
    }
      setAnalysisResult(formattedResult);
    } catch {
      setAnalysisError("Failed to analyze photo. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    const state = location.state || {};
    const photoFromState = state.photo;
    if (photoFromState) {
      setPhoto(photoFromState);
      analyzePhoto(photoFromState);
    }
  }, [location, analyzePhoto]);

  const formatApiResponse = (data) => {
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data === 'object' && data !== null) {
      let formatted = '';
      if (data.response) {
        formatted += data.response + '\n\n';
      }if (data.result) {
        formatted += data.result + '\n\n';
      }if (data.message) {
        formatted += data.message + '\n\n';
      }if (data.description) {
        formatted += data.description + '\n\n';
      }if (data.type) {
        formatted += `Type: ${data.type}\n`;
      }if (data.category) {
        formatted += `Category: ${data.category}\n`;
      }if (data.recyclable !== undefined) {
        formatted += `Recyclable: ${data.recyclable ? 'Yes' : 'No'}\n`;
      }if (data.instructions) {
        formatted += `\nInstructions:\n${data.instructions}`;
      }if (data.tips) {
        formatted += `\n\nTips:\n${data.tips}`;
      }     
      if (!formatted) {
        Object.entries(data).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
            if (typeof value === 'object') {
              formatted += `${formattedKey}:\n${JSON.stringify(value, null, 2)}\n\n`;
            } else {
              formatted += `${formattedKey}: ${value}\n\n`;
            }
          }
        });
      }
      
      return formatted.trim();
    }
    
    return String(data);
  };

  return (
    <PageShell title="Camera Response" backTo={-1}>
      <div style={{ marginTop: "2rem" }}>
        {photo && (
          <img 
            src={photo} 
            alt="Captured" 
            style={{ borderRadius: "8px", width: "100%", maxWidth: 400, marginBottom: "1rem" }} 
          />
        )}
        
        <div className="chat-output-box" style={{ marginTop: "1rem" }}>
          {isAnalyzing ? (
            <div className="chat-muted">Analyzing photo...</div>
          ) : analysisError ? (
            <div className="chat-muted" style={{ color: "#923647ff" }}>{analysisError}</div>
          ) : analysisResult ? (
            <div className="chat-response">{analysisResult}</div>
          ) : (
            <div className="chat-muted"></div>
          )}
        </div>
        
        <div style={{ marginTop: "2rem" }}>
          <button className="go-button" onClick={() => navigate("/recenter")}> 
            <FaRecycle  /> <span></span> Recycling Center
          </button>
          <button className="go-button" onClick={() => navigate("/chat")}><IoChatbubblesOutline className="chat-icon" size={25} /></button>

        </div>
      </div>
    </PageShell>
  );
}

// -----------------------------------Mic page-----------------------------------
function Mic() {
  const navigate = useNavigate();
  const [micOn, setMicOn] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);
  const mediaStreamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const requestAbortRef = useRef(null);
  const mimeTypeRef = useRef(null);

  const pickMimeType = () => {
    if (window.MediaRecorder?.isTypeSupported?.("audio/webm;codecs=opus")) {
      return "audio/webm;codecs=opus";
    }
    if (window.MediaRecorder?.isTypeSupported?.("audio/webm")) {
      return "audio/webm";
    }

    return "";
  };

  // toggling mic on and off 
  const handleMicClick = () => {
    setError(null);
    setMicOn(prev => {
      const next = !prev;
      if (next) {
        //  on
        startRecording();
      } else {
        //  off and also stop recorder and cancel any request
        stopAll({ cancelRequest: true });
      }
      return next;
    });
  };

  const onKeyDown = (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleMicClick();
    }
  };

  const startRecording = async () => {
    try {
      // request mic
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // here is gonna configure recorder
      const preferred = pickMimeType();
      const recorder = new MediaRecorder(stream, preferred ? { mimeType: preferred } : undefined);
      recorderRef.current = recorder;
      mimeTypeRef.current = recorder.mimeType || preferred || "audio/webm";

      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onerror = (e) => {
        setError(`Recorder error: ${e.error?.message || e.message || "unknown"}`);
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current || "audio/webm" });
          if (!blob || blob.size === 0) return;
          setLoading(true);
          const { answer } = await sendAudioToServer(blob); 
          // send the answer to the chat page
          navigate("/chat", { state: { fromMic: true, transcript: "", answer } });

        } catch (err) {
          if (err.name === "AbortError") return;
          setError(err.message || "Failed to process audio.");
        } finally {
          setLoading(false);
          // turn mic off
          setMicOn(false);
          stopAll();
        }
      };
      // start recording
      recorder.start(250);
    } catch (err) {
      setError(err?.message || "Microphone access failed.");
      setMicOn(false);
      stopAll();
    }
  };

  const sendAudioToServer = async (audioBlob) => {
    requestAbortRef.current = new AbortController();

    const form = new FormData();
    form.append("audio", audioBlob, "audio.wav");
    const res = await fetch(
      'https://noggin.rea.gent/fantastic-felidae-1187',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer rg_v1_c5o5yn557nvnn54dnjlmswub5isa24b9mtwt_ngk',
        },
        body: form,
        signal: requestAbortRef.current.signal,
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Server error ${res.status}${text ? `: ${text}` : ""}`);
    }

    const responseText = await res.text();
    return { answer: responseText };
  };

  const stopAll = ({ cancelRequest = false } = {}) => {
    try {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
    } catch { 
        //ignore
      }
    recorderRef.current = null;

    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks?.().forEach(t => t.stop());
      } catch { 
        //ignore
      }
      mediaStreamRef.current = null;
    }

    if (cancelRequest && requestAbortRef.current) {
      try { requestAbortRef.current.abort(); } catch { 
        //ignore
      }
    }
    requestAbortRef.current = null;
  };


  useEffect(() => {
    return () => stopAll({ cancelRequest: true });
  }, []);

  return (
     <PageShell title="Speak to AI" backTo={-1}>
      <div className={`mic-visual ${micOn ? "active" : ""}`}>
        {!micOn && <p className="mic-hint" aria-live="polite">{loading ? "Processing…" : "Tap to speak"}</p>}
        {micOn && (
          <div className="square" aria-hidden={!micOn}>
            <span></span><span></span><span></span>
          </div>
        )}
      </div>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <button
          type="button"
          className="mic-button"
          onClick={handleMicClick}
          onKeyDown={onKeyDown}
          aria-pressed={micOn}
          aria-label={micOn ? "Stop microphone" : "Start microphone"}
          disabled={loading}
        >
          <LuMic className="micpage-icon" />
        </button>
      </div>
      <div style={{ textAlign: "center", marginTop: "0.75rem" }}>
        {micOn && <small>Listening… tap again to stop.</small>}
        {!micOn && loading && <small>Thinking…</small>}
        {error && <div role="alert" style={{ color: "#923647ff", marginTop: "0.5rem" }}>{error}</div>}
      </div>
    </PageShell>
  );
}

// -----------------------------------MIC Result page-----------------------------------
function Resultmic() {
  const navigate = useNavigate();
  return (
    <PageShell title="MIC RESULT p">
      <h3>Berkeley</h3>
      <div style={{ marginTop: "20rem" }}>
        <button className="go-button" onClick={() => navigate("/recenter")}>
          Recycling Center
        </button>
      </div>
    </PageShell>
  );
}

// -----------------------------------Chat page-----------------------------------
function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle mic response when coming from mic page
  useEffect(() => {
    const state = location.state || {};
    if (state.fromMic && state.answer) {
      setAiResponse(state.answer);
    }
  }, [location]);

  const handleSubmit = async () => {
    if (!q.trim()) return;

    setIsLoading(true);
    setAiResponse("");

    const response = await fetch(
      'https://noggin.rea.gent/yelling-locust-5253', 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer rg_v1_o1388y4kdvdid2c10jcb55l3sfcvd7osarr9_ngk', 
        },
        body: JSON.stringify({
          "question": q, 
        }),
      }
    );

    const responseText = await response.text();
    setAiResponse(responseText);
    setIsLoading(false);
  };

  return (
    <PageShell title="Chat with AI" >
      <div>
        <h5>What recycling question do you have?</h5>

        <div className="chat-inline-wrap">
          <div style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              id="chat-input"
              placeholder="Type Here..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={{ paddingRight: "80px" }}
            />
            
            <div style={{ position: "absolute", right: "5px", top: "50%", transform: "translateY(-50%)", display: "flex", gap: "5px" }}>
              <button
                className="go-button "
                onClick={handleSubmit}
                disabled={isLoading || !q.trim()}
                style={{ padding: "3px 5px", fontSize: "0.8rem" }}
              >
                {isLoading ? "..." : "Ask AI"}
              </button>
              <span></span><span></span> <span></span><span></span><span></span><span></span>
              <IoIosMic
                onClick={() => navigate("/mic")}
                className="mic-icon"
                size={30} 
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="chat-output-box">
        {isLoading ? (
          <div className="chat-muted">Thinking...</div>
        ) : aiResponse ? (
          <div className="chat-response">{aiResponse}</div>
        ) : (
          <div className="chat-muted"></div>
        )}
      </div>

      <div>
        <button className="go-button" onClick={() => navigate("/recenter")}>
          <FaRecycle /> <span></span> Recycling Center
        </button>
        <button className="go-button" onClick={() => navigate("/camera")}><IoCamera class name="camera-icon" size={25} /></button>

      </div>
      <div> </div>
    </PageShell>
  );
}

// -----------------------------------Result page-----------------------------------
function Result() {
  const navigate = useNavigate();
  
  const handleMapClick = () => {
    navigate("/recenter");
  };
  
  return (
    <PageShell title="RESULT PAGE">
      <div style={{ marginTop: "20rem" }}>
        <button className="go-button" onClick={handleMapClick}>
          <FaRecycle /> <span></span> Center </button>
      </div>
    </PageShell>
  );
}

// -----------------------------------Recenter page-----------------------------------
function Recenter() {
  const navigate = useNavigate();
  // Get both the saved location (city, state) and the zip code
  const userLocation = localStorage.getItem("userLocation") || "Berkeley, CA";

  // Use the userLocation for the Google Maps URL
  // We'll use the userLocation to provide a more specific search query.
  const mapsUrl = `http://maps.google.com/?q=recycling+center+near+${encodeURIComponent(userLocation)}`;

  const openGoogleMaps = () => {
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };
  const recyclingCenters = [
    { name: "Recycling Center", distance: "0.8 miles" },
    { name: "Municipal Waste Facility", distance: "2.1 miles" },
    { name: "Household Hazardous Waste", distance: "3.2 miles" },
    { name: "Community Recycling", distance: "4.5 miles" },
    { name: "Sanitary Service", distance: "6.8 miles" }
  ];
  return (
    <PageShell>
      <div className="recenter-container">
        <h4 className="recenter-title">
          Recycling Centers Near: {userLocation}
        </h4>
        <div className="recycling-list">
          {recyclingCenters.map((center, index) => (
            <div key={index} className="recycling-card">
              <div className="recycling-card-header">
                <h5 className="recycling-card-title">
                  {index + 1}. {center.name}
                </h5>
                <span className="recycling-distance">{center.distance}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="recenter-buttons">
          <button className="go-button" onClick={openGoogleMaps}>
            Open Google Maps
          </button>
          <button className="go-button" onClick={() => navigate("/")}>
            <IoHomeOutline /> <span></span> 
          </button>
        </div>
      </div>
    </PageShell>
  );
}

// ---- Our Router ----
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/camera" element={<Camera />} />
      <Route path="/mic" element={<Mic />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/result" element={<Result />} />
      <Route path="/resultmic" element={<Resultmic />} />
      <Route path="/resultcamera" element={<Resultcamera />} />
      <Route path="/recenter" element={<Recenter />} />


// ---- Our 404 Page ----
      <Route path="*" element={<div className="container">
        <h2>ERROR: Page not found</h2></div>} />
    </Routes>
  );
}