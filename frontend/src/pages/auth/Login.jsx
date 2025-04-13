import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import React from "react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handles both email & password
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "https://zerowastex-smart-waste-disposal-system.onrender.com/api/auth/login",
        formData
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);

      if (response.data.role === "resident") navigate("/resident-dashboard");
      else if (response.data.role === "collector")
        navigate("/collector-dashboard");
      else if (response.data.role === "admin") navigate("/admin-dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      alert("Please enter your email first.");
      return;
    }

    try {
      const response = await fetch(
        "https://zerowastex-smart-waste-disposal-system.onrender.com/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Reset password mail sent.");
      } else {
        alert(data.error || "Failed to send reset mail.");
      }
    } catch (error) {
      alert("An error occurred. Try again later.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-green-200 to-green-800">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold py-2 rounded-md hover:bg-green-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center mt-4 text-gray-600">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-green-500 font-semibold hover:underline"
          >
            Register
          </a>
        </p>

        <p
          className="text-sm text-center mt-3 text-green-500 font-semibold hover:underline cursor-pointer"
          onClick={handleForgotPassword}
        >
          Forgot Password?
        </p>
      </div>
    </div>
  );
};

export default Login;
