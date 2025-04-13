import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import React from "react";

const RouteViewer = ({ steps, coordinates }) => {
  const routeCoords = coordinates.map(([lng, lat]) => [lat, lng]);

  const openGoogleMaps = () => {
    const start = routeCoords[0];
    const end = routeCoords[routeCoords.length - 1];
    const url = `https://www.google.com/maps/dir/?api=1&origin=${start[0]},${start[1]}&destination=${end[0]},${end[1]}&travelmode=driving`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full">
      {/* 🗺️ Map */}
      <div style={{ height: "500px", width: "100%" }}>
        <MapContainer
          center={routeCoords[0]}
          zoom={13}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polyline positions={routeCoords} color="blue" />
          <Marker position={routeCoords[0]} />
          <Marker position={routeCoords[routeCoords.length - 1]} />
        </MapContainer>
      </div>

      {/* 📋 Instructions */}
      <div className="p-5 bg-white rounded-xl shadow-md mt-6 border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
          🛣 Route Instructions
        </h2>

        {steps.length === 0 ? (
          <p className="text-sm text-gray-500 italic">
            No instructions available for this route.
          </p>
        ) : (
          <ul className="space-y-3 text-sm text-gray-700 list-disc pl-6">
            {steps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                <span className="font-semibold">{step.instruction}</span> on{" "}
                <span className="italic text-blue-600">{step.name}</span>
                <span className="ml-2 text-gray-500 text-xs">
                  ({(step.distance / 1000).toFixed(2)} km •{" "}
                  {(step.duration / 60).toFixed(1)} min)
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* 🚗 Google Maps Button */}
        <div className="mt-6">
          <button
            onClick={openGoogleMaps}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 12.414M13.414 12.414L9.172 8.172M13.414 12.414L9.172 16.657M13.414 12.414L17.657 8.172"
              />
            </svg>
            Navigate in Google Maps
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteViewer;
