import React, { useEffect, useState } from "react";
import axios from "axios";

const CenterDashboard = ({ centerId }) => {
  const [collectors, setCollectors] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, pending: 0, completed: 0 });

  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const res = await axios.get(`/api/center/${centerId}/collectors`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setCollectors(res.data);
      } catch (err) {
        console.error("Error fetching collectors:", err);
      }
    };

    const fetchSummary = async () => {
      try {
        const res = await axios.get(`/api/center/${centerId}/summary`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      }
    };

    fetchCollectors();
    fetchSummary();
  }, [centerId]);

  return (
    <div className="p-6 bg-gradient-to-r from-green-200 to-green-800">
      <h1 className="text-2xl font-bold mb-4">Center Dashboard</h1>

      {/* Pickup Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(summary).map(([key, value]) => (
          <div key={key} className="bg-gray-100 p-4 rounded-xl text-center shadow">
            <p className="text-xl font-bold">{value}</p>
            <p className="text-sm text-gray-600 capitalize">{key}</p>
          </div>
        ))}
      </div>

      {/* Collector List */}
      <h2 className="text-xl font-semibold mt-6 mb-2">Collectors</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {collectors.map((collector) => (
          <div
            key={collector._id}
            className="p-4 bg-white rounded-xl shadow border border-gray-200"
          >
            <p className="text-lg font-semibold">{collector.name}</p>
            <p className={`text-sm mt-1 font-medium ${collector.isAvailable ? "text-green-600" : "text-red-600"}`}>
              {collector.isAvailable ? "Available" : "Unavailable"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CenterDashboard;
