import React, { useEffect, useState } from "react";
import axios from "axios";
import InactiveResidents from "./InactiveResident";
import InactiveCollectors from "./InactiveCollector";
import CenterAnalytics from "./CenterAnalytics";
import CenterRankings from "./CenterRanking";
import UsageAnalytics from "./UsageAnalaytics";

const AdminDashboard = () => {
  const [pickupRequests, setPickupRequests] = useState([]);
  const [userStats, setUserStats] = useState({});
  const [pickupStats, setPickupStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [requestsRes, userStatsRes, pickupStatsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/admin/active-pickups", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/users-stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/admin/pickup-stats", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setPickupRequests(requestsRes.data);
      setUserStats(userStatsRes.data);
      setPickupStats(pickupStatsRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsComplete = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/pickups/complete-pickup/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPickupRequests((prev) =>
        prev.map((request) =>
          request._id === id ? { ...request, status: "completed" } : request
        )
      );
    } catch (error) {
      console.error("Error marking as complete:", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen bg-gradient-to-r from-green-200 to-green-800">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      {/* Stat Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Total Residents</p>
          <p className="text-2xl font-bold text-blue-600">
            {userStats.totalResidents || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Total Collectors</p>
          <p className="text-2xl font-bold text-purple-600">
            {userStats.totalCollectors || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Completed Pickups</p>
          <p className="text-2xl font-bold text-green-600">
            {pickupStats.completed || 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow hover:shadow-lg transition">
          <p className="text-sm text-gray-500">Pending Pickups</p>
          <p className="text-2xl font-bold text-red-500">
            {pickupStats.pending || 0}
          </p>
        </div>
      </div>

      <UsageAnalytics />

      {/* Active Pickups Table */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          🚚 Active Pickup Requests
        </h3>
        {pickupRequests.length === 0 ? (
          <p className="text-gray-500">No active pickups.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm">
                  <th className="px-4 py-2 text-left">Resident</th>
                  <th className="px-4 py-2 text-left">Address</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Urgency</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {pickupRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-3">{request.user?.name || "N/A"}</td>
                    <td className="px-4 py-3">{request.address || "N/A"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          request.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          request.urgency === "High"
                            ? "bg-red-100 text-red-700"
                            : request.urgency === "Medium"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {request.urgency || "Normal"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {request.status === "pending" ? (
                        <button
                          onClick={() => markAsComplete(request._id)}
                          className="bg-green-500 hover:bg-green-600 text-white text-sm px-4 py-1 rounded-full transition"
                        >
                          Mark Complete
                        </button>
                      ) : (
                        <span className="text-sm text-gray-500">
                          ✔️ Completed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InactiveResidents />
      <InactiveCollectors />
      <CenterAnalytics />
      <CenterRankings />
    </div>
  );
};

export default AdminDashboard;
