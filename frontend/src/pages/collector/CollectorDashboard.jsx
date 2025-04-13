import React, { useEffect, useState } from "react";
import axios from "axios";
import RouteViewer from "../../components/RouteViewer"; //
import PickupHistory from "./PickupHistory";
import CollectorStats from "./CollectorStats";

const CollectorDashboard = ({ collectorId }) => {
  const [pickups, setPickups] = useState([]);
  const [message, setMessage] = useState("");
  const [routes, setRoutes] = useState({}); // Store route info per pickup

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://zerowastex-smart-waste-disposal-system.onrender.com/api/pickup/collector",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setPickups(response.data);
      } catch (error) {
        console.error("Failed to fetch pickups:", error);
      }
    };

    fetchPickups();
  }, []);

  const fetchRoute = async (pickupId, pickup) => {
    try {
      const centerCoords = pickup.center?.location?.coordinates;

      if (!centerCoords) {
        alert("Center location not available.");
        return;
      }

      // Geocode resident address
      const geoRes = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: { q: pickup.address, format: "json" },
        }
      );

      if (!geoRes.data || geoRes.data.length === 0) {
        alert("Failed to geocode address.");
        return;
      }

      const pickupLocation = [
        parseFloat(geoRes.data[0].lon),
        parseFloat(geoRes.data[0].lat),
      ];

      const routeRes = await axios.post("https://zerowastex-smart-waste-disposal-system.onrender.com/api/routes", {
        start: centerCoords,
        end: pickupLocation,
      });

      setRoutes((prev) => ({
        ...prev,
        [pickupId]: routeRes.data,
      }));
    } catch (error) {
      console.error("Failed to fetch route:", error);
    }
  };

  const completePickup = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `https://zerowastex-smart-waste-disposal-system.onrender.com/api/pickup/complete-pickup/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage("Pickup marked as completed!");
      setPickups((prev) => prev.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Failed to complete pickup:", error);
      setMessage("Failed to complete pickup");
    }
  };

  return (
    <div className="p-8 bg-gradient-to-r from-green-200 to-green-800">
      <h2 className="text-3xl font-bold mb-4">Collector Dashboard</h2>
      <div className="bg-gray-100 p-6 rounded-md">
        {pickups.length > 0 ? (
          pickups.map((pickup) => (
            <div
              key={pickup._id}
              className="border p-4 mb-6 rounded-md shadow-sm"
            >
              <p>
                <strong>📍 Address:</strong> {pickup.address}
              </p>
              <p>
                <strong>🗑️ Type:</strong> {pickup.wasteType}
              </p>
              <p>
                <strong>⚖️ Weight:</strong> {pickup.weight} kg
              </p>
              <p>
                <strong>🚦 Status:</strong> {pickup.status}
              </p>

              {pickup.status !== "completed" && (
                <>
                  <button
                    onClick={() => completePickup(pickup._id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-3 mr-2"
                  >
                    ✅ Mark as Completed
                  </button>

                  <button
                    onClick={() => fetchRoute(pickup._id, pickup)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-3"
                  >
                    📍 Show Optimized Route
                  </button>
                </>
              )}

              {routes[pickup._id]?.route && (
                <div className="mt-4 bg-white border rounded p-3 ">
                  <p className="text-lg font-semibold mb-2">
                    <span className="inline-block mr-2">🚗</span>
                    Distance:{" "}
                    <span className=" font-bold">
                      {(
                        routes[pickup._id].route.segments?.[0]?.distance / 1000
                      ).toFixed(2)}{" "}
                      km
                    </span>
                  </p>
                  <p className="text-lg font-semibold">
                    <span className="inline-block mr-2">⏱</span>
                    Time:{" "}
                    <span className=" font-bold">
                      {(
                        routes[pickup._id].route.segments?.[0]?.duration / 60
                      ).toFixed(2)}{" "}
                      mins
                    </span>
                  </p>

                  {routes[pickup._id].route.waypoints && (
                    <RouteViewer
                      steps={
                        routes[pickup._id].route.segments?.[0]?.steps || []
                      }
                      coordinates={
                        routes[pickup._id].route.waypoints?.map((wp) => [
                          wp.lng,
                          wp.lat,
                        ]) || []
                      }
                    />
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No pickups assigned yet.</p>
        )}
      </div>

      {message && <p className="mt-4 text-green-600">{message}</p>}
      <CollectorStats collectorId={collectorId} />
      <PickupHistory collectorId={collectorId} />
    </div>
  );
};

export default CollectorDashboard;
