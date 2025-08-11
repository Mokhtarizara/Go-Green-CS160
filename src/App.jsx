import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [entered, setEntered] = useState(location.state?.entered || false);
  const [zip, setZip] = useState("");
  //CHANGED THIS
  const [userLocation, setUserLocation] = useState("");

  //CHANGED THIS
  useEffect(() => {
    const savedLocation = localStorage.getItem("userLocation");
    const savedZip = localStorage.getItem("savedLocation");
    if (savedLocation) {
      setUserLocation(savedLocation);
    }
    if (savedZip) {
      setZip(savedZip);
    }
  }, []);

  //CHANGED THIS
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
    setUserLocation(cityState);
    localStorage.setItem("userLocation", cityState);
    return cityState;
  };

  //CHANGED THIS
  const getLocationAndZipcode = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
        );
        
        const data = await response.json();
        const zipcode = data.address?.postcode;
        
        if (zipcode) {
          setZip(zipcode);
          localStorage.setItem("savedLocation", zipcode);
          await getCityStateFromZipcode(zipcode);
        }
      }
    );
  };

  //CHANGED THIS
  const handleEnter = async () => {
    if (zip.trim()) {
      localStorage.setItem("savedLocation", zip.trim());
      await getCityStateFromZipcode(zip.trim());
    }
    setEntered(true); // unlock the buttons
  };

  return (
    <div className="container">
      <h1>Go Green</h1>
      {/*CHANGED THIS*/}
      {userLocation && <h3>{userLocation}</h3>}
      {/*CHANGED THIS*/}
      {!userLocation && <h4>Please type your zip code or allow location access.</h4>}
    
      {/*CHANGED THIS*/}
      <div>
        <button 
          className="go-button" 
          onClick={getLocationAndZipcode}
        >
          📍 Get My Location
        </button>
      </div>
    
      <div>
        <input
          type="text" id="inputzip" placeholder="Zipcode / City" 
          className="inputzip" value={zip} onChange={(e) => setZip(e.target.value)}
        />
      </div>

      {/*CHANGED THIS*/}
      <div style={{ marginTop: "0.1rem" }}>
            <button
              className="go-button"
              onClick={async () => {
                if (zip.trim()) {
                  localStorage.setItem("savedLocation", zip.trim());
                  await getCityStateFromZipcode(zip.trim());
                }
              }}
              disabled={!zip.trim()}
              style={{
                fontSize: "0.9rem",
                padding: "0.5rem 1rem",
                minWidth: "auto"
              }}
            >
              Update Location
            </button>
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
  //CHANGED THIS
  const userLocation = localStorage.getItem("userLocation") || "";
  
  return (
    <div className="container">
      {/*CHANGED THIS*/}
      <button className="go-button" onClick={() => navigate("/", { state: { entered: true } })}>Back</button>
      {/*CHANGED THIS*/}
      {userLocation && <h3 style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>{userLocation}</h3>}
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
        <button className="go-button" onClick={() => navigate("/items")}>Capture</button>
      </div>
    </PageShell>
  );
}

// -----------------------------------Mic page-----------------------------------
function Mic() {
  const navigate = useNavigate();
  return (
    <PageShell title="MIC PAGE">
      <div style={{ marginTop: "20rem" }}>
        <button className="go-button" onClick={() => navigate("/result")}>click me</button>
      </div>
    </PageShell>
  );
}

// -----------------------------------Chat page-----------------------------------
function Chat() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  //CHANGED THIS
  const [aiResponse, setAiResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  //CHANGED THIS
  const handleSubmit = async () => {
    if (!q.trim()) return;
    
    setIsLoading(true);
    setAiResponse("");
    
    const response = await fetch(
      'https://noggin.rea.gent/fantastic-felidae-1187',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer rg_v1_c5o5yn557nvnn54dnjlmswub5isa24b9mtwt_ngk',
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
    <PageShell title="CHAT PAGE">
      <div>
        {/*CHANGED THIS*/}
        <input
          type="text"
          id="chat-input"
          placeholder="What recycling question do you have?"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          style={{ width: "300px" }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
      </div>
      
      {/*CHANGED THIS*/}
      <div style={{ 
        marginTop: "2rem", 
        marginBottom: "2rem",
        minHeight: "100px",
        padding: "1rem",
        backgroundColor: "#f8f9fa",
        borderRadius: "8px",
        border: "1px solid #dee2e6"
      }}>
        {isLoading ? (
          <div style={{ textAlign: "center", color: "#6c757d" }}>
            Thinking...
          </div>
        ) : aiResponse ? (
          <div style={{ whiteSpace: "pre-wrap" }}>
            {aiResponse}
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#6c757d" }}>
            
          </div>
        )}
      </div>
      
      <div>
        {/*CHANGED THIS*/}
        <button 
          className="go-button" 
          onClick={handleSubmit}
          disabled={isLoading || !q.trim()}
        >
          {isLoading ? "Processing..." : "Ask AI"}
        </button>
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
  
  //CHANGED THIS
  const handleMapClick = () => {
    navigate("/recenter");
  };
  
  return (
    <PageShell title="RESULT PAGE">
      <div style={{ marginTop: "20rem" }}>
        <button className="go-button" onClick={handleMapClick}>
          Recycling Center Near Me
        </button>
      </div>
    </PageShell>
  );
}
// -----------------------------------Recenter page-----------------------------------
//CHANGED THIS
function Recenter() {
  const navigate = useNavigate();
  const savedZip = localStorage.getItem("savedLocation") || "Berkeley, CA";
  
  //CHANGED THIS
  const mapsUrl = `https://www.google.com/maps/search/recycling+centers+near+${encodeURIComponent(savedZip)}`;
  
  //CHANGED THIS
  const openGoogleMaps = () => {
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };
  
  //CHANGED THIS
  const recyclingCenters = [
    {
      name: "Recycling Center",
      distance: "0.8 miles"
    },
    {
      name: "Municipal Waste Facility",
      distance: "2.1 miles"
    },
    {
      name: "Household Hazardous Waste",
      distance: "3.2 miles"
    },
    {
      name: "Community Recycling",
      distance: "4.5 miles"
    },
    {
      name: "Sanitary Service",
      distance: "6.8 miles"
    }
  ];
  
  return (
    <PageShell title="CENTER MAP PAGE">
      <div style={{ 
        marginTop: "2rem",
        marginBottom: "2rem",
        padding: "1rem"
      }}>
        <h4 style={{ marginBottom: "2rem", textAlign: "center" }}>
          Recycling Centers Near: {savedZip}
        </h4>
        
        {/*CHANGED THIS*/}
        <div style={{
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
          marginBottom: "2rem"
        }}>
          {recyclingCenters.map((center, index) => (
            <div key={index} style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              backgroundColor: "#fff",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center"
              }}>
                <h5 style={{ 
                  margin: "0", 
                  color: "#1e4d2b", 
                  fontSize: "1.1rem",
                  fontWeight: "bold"
                }}>
                  {index + 1}. {center.name}
                </h5>
                <span style={{ 
                  backgroundColor: "#1e4d2b", 
                  color: "white", 
                  padding: "0.2rem 0.5rem", 
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  fontWeight: "bold"
                }}>
                  {center.distance}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {/*CHANGED THIS*/}
        <div style={{ 
          display: "flex", 
          gap: "1rem", 
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
                             <button
                     className="go-button"
                     onClick={openGoogleMaps}
                   >
                     Open Google Maps
                   </button>
          
          <button className="go-button" onClick={() => navigate("/")}>
            Home
          </button>
        </div>
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
      {/*CHANGED THIS*/}
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
