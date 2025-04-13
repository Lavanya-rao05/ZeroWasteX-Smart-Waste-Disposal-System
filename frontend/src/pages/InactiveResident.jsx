import React, { useEffect, useState } from "react";
import axios from "axios";

const InactiveResidents = () => {
  const [inactiveCount, setInactiveCount] = useState(0);

  useEffect(() => {
    const fetchInactiveCount = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/residents/inactive-count")
        setInactiveCount(res.data.inactiveCount);
      } catch (err) {
        console.error("Failed to fetch inactive resident count:", err);
      }
    };

    fetchInactiveCount();
  }, []);

  return (
    <div className="bg-white text-black p-4 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        💤 Inactive Residents (No Pickup in 7+ Days)
      </h2>

      {inactiveCount > 0 ? (
        <p className="text-red-500 font-semibold">{inactiveCount} residents inactive ❌</p>
      ) : (
        <p className="text-green-500 font-semibold">All residents are active 🚀</p>
      )}
    </div>
  );
};

export default InactiveResidents;
