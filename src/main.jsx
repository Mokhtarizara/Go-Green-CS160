import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // new import for routing
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter> {/*  we wrapped the routes in browserrouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
