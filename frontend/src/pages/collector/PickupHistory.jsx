import React, { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const PickupHistory = () => {
  const [history, setHistory] = useState([]);
  const [collectorId, setCollectorId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        const decoded = jwtDecode(token);
      if (decoded.role === "collector") {
        setCollectorId(decoded.id); // or decoded._id if that’s how you sent it
      }
    }
  }, []);

  useEffect(() => {
    if (!collectorId) return;

    axios
      .get(`https://zerowastex-smart-waste-disposal-system.onrender.com/api/pickup/${collectorId}/completed-pickups`)
      .then((res) => setHistory(res.data))
      .catch((err) => console.error("Error:", err));
  }, [collectorId]);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Completed Pickups</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Pickup ID</th>
            <th className="p-2">Resident</th>
            <th className="p-2">Date</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(history) &&
            history.map((pickup) => (
              <tr key={pickup._id} className="border-b">
                <td className="p-2">{pickup._id}</td>
                <td className="p-2">{pickup.user?.name || "N/A"}</td>
                <td className="p-2">
                  {new Date(pickup.completedAt).toLocaleString()}
                </td>
                <td className="p-2 text-green-600 font-semibold">
                  ✅ Completed
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default PickupHistory;
