import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import React from "react";

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold">Welcome, {user?.role}!</h1>
            <button className="mt-4 bg-red-500 text-white p-2 rounded" onClick={() => { logout(); navigate("/"); }}>
                Logout
            </button>
        </div>
    );
};

export default Dashboard;
