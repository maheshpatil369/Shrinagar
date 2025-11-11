import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; 
import App from "./App"; 
import "./index.css";
import { AuthModalProvider } from "./context/AuthModalContext"; 
import { UserProvider } from "./context/UserContext"; 
import AuthModal from "./components/AuthModal"; 

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <AuthModalProvider>
          <App />
          <AuthModal /> 
        </AuthModalProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);