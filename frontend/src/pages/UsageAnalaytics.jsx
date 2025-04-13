import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import React, { useEffect, useState } from "react";
import axios from "axios";

const UsageAnalytics = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:5000/api/pickup/usage", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setData(res.data))
      .catch((err) => console.error("Analytics fetch error:", err));
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow mb-8">
      <h3 className="text-lg font-semibold mb-4">
        📈 Usage Analytics (Last 6 Months)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="residents" fill="#3b82f6" name="New Residents" />
          <Bar dataKey="pickups" fill="#10b981" name="Waste Pickups" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageAnalytics;
