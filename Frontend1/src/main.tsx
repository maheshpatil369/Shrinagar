import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; 
import App from "./App"; 
import "./index.css";
import { AuthModalProvider } from "./context/AuthModalContext"; 
import { UserProvider } from "./context/UserContext"; 
// FIX: Removed curly braces. AuthModal is a default export.
import AuthModal from "./components/AuthModal"; 
import { ThemeProvider } from "next-themes";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
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