import React from "react";
import ReactDOM from "react-dom/client";
// 1. Import ChatReader (Named export uses curly braces {})
import { ChatReader } from "./ChatReader";
import "./index.css"; 

ReactDOM.createRoot(document.getElementById("root")!).render(
  // 2. Wrap ChatReader in the ErrorBoundary
  <ErrorBoundary>
    <ChatReader />
  </ErrorBoundary>
);

