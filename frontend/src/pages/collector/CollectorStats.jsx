import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";

const COLORS = ["#10b981", "#facc15", "#ef4444"];

const CollectorStats = ({ collectorId }) => {
  const [monthly, setMonthly] = useState([]);
  const [status, setStatus] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token"); // or sessionStorage if you use that
  
    axios
      .get("https://zerowastex-smart-waste-disposal-system.onrender.com/api/pickup/collector/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const { monthlyStats, statusBreakdown } = res.data;
        setMonthly(monthlyStats);
        setStatus(statusBreakdown);
      })
      .catch((err) => console.error("Stats error:", err));
  }, []);
  

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      {/* Monthly Bar Chart */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">Monthly Pickups</h3>
        <BarChart width={300} height={200} data={monthly}>
          <XAxis dataKey="_id" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3b82f6" />
        </BarChart>
      </div>

      {/* Status Pie Chart */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">Status Breakdown</h3>
        <PieChart width={300} height={200}>
          <Pie
            data={status}
            dataKey="count"
            nameKey="_id"
            cx="50%"
            cy="50%"
            outerRadius={70}
            label
          >
            {Array.isArray(status) &&
              status.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
          </Pie>
        </PieChart>
      </div>
    </div>
  );
};

export default CollectorStats;
