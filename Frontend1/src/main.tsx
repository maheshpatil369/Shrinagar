// Frontend1/src/main.tsx
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; 
import App from "./App"; 
import "./index.css";
import { AuthModalProvider } from "./context/AuthModalContext"; 
import { UserProvider } from "./context/UserContext"; 
import AuthModal from "./components/AuthModal"; 
import { ThemeProvider } from "next-themes"; // Import ThemeProvider

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Wrap the entire app in ThemeProvider */}
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <UserProvider>
          <AuthModalProvider>
            <App />
            <AuthModal /> 
          </AuthModalProvider>
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);