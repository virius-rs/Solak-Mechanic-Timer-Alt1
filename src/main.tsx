import React from "react";
import ReactDOM from "react-dom/client";
// 1. Import ChatReader directly (Named export)
import { ChatReader } from "./ChatReader";
import "./index.css"; 

// 2. Render simple app without ErrorBoundary or StrictMode
ReactDOM.createRoot(document.getElementById("root")!).render(
  <ChatReader />
);
