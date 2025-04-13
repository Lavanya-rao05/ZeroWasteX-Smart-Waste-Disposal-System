import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import "tailwindcss";
import 'leaflet/dist/leaflet.css';


ReactDOM.createRoot(document.getElementById("root")).render(
    <AuthProvider>
        <AppRoutes />
    </AuthProvider>
);
