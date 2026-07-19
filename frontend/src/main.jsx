import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#161625", color: "#fff", border: "1px solid #2A2A40" },
          success: { iconTheme: { primary: "#2DD4A8", secondary: "#161625" } },
          error: { iconTheme: { primary: "#E54B4B", secondary: "#161625" } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
