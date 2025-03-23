import React from "react";
import "react-toastify/dist/ReactToastify.css";
import ReactDOM from "react-dom/client";
import App from "./App";
import { NotificationProvider } from "./context/NotificationContext";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import { ToastContainer } from "react-toastify";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider> {/* Wrap App inside AuthProvider */}
      <NotificationProvider>
        <ToastContainer />
        <App />
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
);
