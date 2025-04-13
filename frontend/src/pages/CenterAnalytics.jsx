import React, { useState, useEffect } from "react";
import axios from "axios";

const CenterAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/admin/center-analytics"
        );
        setAnalytics(response.data);
      } catch (error) {
        console.error("Error fetching analytics", error);
      }
    };

    fetchAnalytics();
  }, []);

  return (
    <div className="p-6">
      <div className="bg-white shadow-lg rounded-2xl p-6 ">
        <h3 className="text-xl font-semibold text-center mb-6">
          📊 Center-wise Analytics
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-center border border-gray-200">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="py-3 px-4 border">Center Name</th>
                <th className="py-3 px-4 border">Total Collectors</th>
                <th className="py-3 px-4 border">Active Pickups</th>
                <th className="py-3 px-4 border">Completed Pickups</th>
              </tr>
            </thead>
            <tbody className="bg-white text-gray-700">
              {analytics.map((center, index) => (
                <tr key={index} className="hover:bg-gray-100 transition">
                  <td className="py-2 px-4 border">{center.centerName}</td>
                  <td className="py-2 px-4 border">{center.totalCollectors}</td>
                  <td className="py-2 px-4 border">{center.activePickups}</td>
                  <td className="py-2 px-4 border">
                    {center.completedPickups}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CenterAnalytics;
