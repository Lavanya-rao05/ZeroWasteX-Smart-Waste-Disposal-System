import React, { useEffect, useState } from "react";
import axios from "axios";

const CenterRankings = () => {
  const [rankings, setRankings] = useState({ topCenters: [], bottomCenters: [] });

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/admin/center-rankings");
        setRankings(data);
      } catch (error) {
        console.error("Error fetching rankings:", error);
      }
    };

    fetchRankings();
  }, []);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold text-green-600 mb-3">🏆 Top Performing Centers</h2>
      <ul className="border border-green-300 rounded-md p-3 bg-green-50">
        {rankings.topCenters.map((center, i) => (
          <li key={i} className="py-2 px-3 border-b last:border-none">
            <strong className="text-green-700">{center.centerName}</strong> – {center.completedPickups} pickups
          </li>
        ))}
      </ul>

      <h2 className="text-xl font-bold text-red-600 mt-6 mb-3">🐢 Slowest Performing Centers</h2>
      <ul className="border border-red-300 rounded-md p-3 bg-red-50">
        {rankings.bottomCenters.map((center, i) => (
          <li key={i} className="py-2 px-3 border-b last:border-none">
            <strong className="text-red-700">{center.centerName}</strong> – {center.completedPickups} pickups
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CenterRankings;
