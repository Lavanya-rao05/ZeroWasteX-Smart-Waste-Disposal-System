import React, { useState, useEffect } from "react";
import axios from "axios";

const ResidentDashboard = () => {
  const [address, setAddress] = useState("");
  const [wasteType, setWasteType] = useState("");
  const [urgency, setUrgency] = useState("low");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [weight, setWeight] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [pickups, setPickups] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Unauthorized. Please log in.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [addressRes, pickupRes] = await Promise.all([
          axios.get("https://zerowastex-smart-waste-disposal-system.onrender.com/api/pickup/saved-addresses", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://zerowastex-smart-waste-disposal-system.onrender.com/api/pickup/history", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const saved = addressRes.data.addresses || [];
        setAddresses(saved);

        if (saved.length > 0) {
          const first = saved[0];
          setAddress(first.address);
          setLatitude(first.latitude.toString());
          setLongitude(first.longitude.toString());
          setWasteType(first.wasteType || "");
          setUrgency(first.urgency || "low");
          setWeight(first.weight?.toString() || "");
          setSelectedAddressIndex(0);
        } else {
          getLocation();
        }

        setPickups(pickupRes.data.pickups || []);
      } catch (err) {
        console.error(err);
        setMessage("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toString());
          setLongitude(position.coords.longitude.toString());
        },
        (error) => {
          console.error("Geolocation error:", error);
          setMessage("Failed to get location.");
        }
      );
    } else {
      setMessage("Geolocation not supported by this browser.");
    }
  };

  const handleRequest = async () => {
    if (!address || !wasteType || !latitude || !longitude || !weight) {
      setMessage("Please fill all the fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return setMessage("Unauthorized. Please log in.");

      const requestData = {
        address,
        wasteType,
        urgency,
        weight,
        longitude: parseFloat(longitude),
        latitude: parseFloat(latitude),
      };

      await axios.post(
        "https://zerowastex-smart-waste-disposal-system.onrender.com/api/pickup/request-pickup",
        requestData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Pickup request submitted successfully!");
      setShowNewAddressForm(false);

      // Refresh pickup history
      const res = await axios.get("https://zerowastex-smart-waste-disposal-system.onrender.com/api/pickup/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPickups(res.data.pickups || []);
    } catch (error) {
      console.error("Failed to submit request:", error);
      setMessage("Failed to submit request.");
    }
  };

  const handleSelectAddress = (index) => {
    const selected = addresses[index];
    setAddress(selected.address);
    setLatitude(selected.latitude.toString());
    setLongitude(selected.longitude.toString());
    setWasteType(selected.wasteType || "");
    setUrgency(selected.urgency || "low");
    setWeight(selected.weight?.toString() || "");
    setSelectedAddressIndex(index);
    setShowNewAddressForm(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Request Waste Pickup</h2>

      {addresses.length > 0 && !showNewAddressForm && (
        <div className="mb-6">
          {addresses.map((addr, idx) => {
            const isSelected = selectedAddressIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => handleSelectAddress(idx)}
                className={`cursor-pointer p-4 rounded shadow-sm mb-4 transition border-2 ${
                  isSelected ? "border-green-500 bg-green-50" : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p><strong>Address:</strong> {addr.address}</p>
                    <p><strong>Waste Type:</strong> {addr.wasteType || "N/A"}</p>
                    <p><strong>Urgency:</strong> {addr.urgency || "N/A"}</p>
                    <p><strong>Weight:</strong> {addr.weight || "N/A"} kg</p>
                    <p><strong>Lat:</strong> {addr.latitude}</p>
                    <p><strong>Long:</strong> {addr.longitude}</p>
                  </div>
                  {isSelected && <div className="text-green-600 text-xl">✅</div>}
                </div>
                <button
                  className="text-sm text-green-600 hover:underline mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddress(addr.address);
                    setLatitude(addr.latitude.toString());
                    setLongitude(addr.longitude.toString());
                    setWasteType(addr.wasteType || "");
                    setUrgency(addr.urgency || "low");
                    setWeight(addr.weight?.toString() || "");
                    setShowNewAddressForm(true);
                    setSelectedAddressIndex(null);
                  }}
                >
                  Edit
                </button>
              </div>
            );
          })}
          <button
            className="text-sm text-blue-700 hover:underline"
            onClick={() => {
              setShowNewAddressForm(true);
              setAddress("");
              setLatitude("");
              setLongitude("");
              setWasteType("");
              setUrgency("low");
              setWeight("");
              setSelectedAddressIndex(null);
            }}
          >
            + Add new address
          </button>
        </div>
      )}

      {(showNewAddressForm || addresses.length === 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Address Form */}
          <div>
            <label className="block text-sm font-medium">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Enter address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Waste Type</label>
            <select
              value={wasteType}
              onChange={(e) => setWasteType(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select type</option>
              <option value="plastic">Plastic</option>
              <option value="organic">Organic</option>
              <option value="metal">Metal</option>
              <option value="paper">Paper</option>
              <option value="e-waste">E-Waste</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Weight (kg)</label>
            <input
              type="number"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Approx. weight"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Urgency</label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Latitude</label>
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Latitude"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Longitude</label>
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Longitude"
            />
          </div>
        </div>
      )}

      <button
        onClick={handleRequest}
        className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
      >
        Submit Pickup Request
      </button>

      {message && <p className="mt-3 text-red-500">{message}</p>}

      {/* Pickup History Section */}
      <div className="bg-gray-100 p-6 rounded-md shadow-inner mt-8">
        <h3 className="text-xl font-semibold mb-4">Pickup History</h3>

        {loading ? (
          <p>Loading...</p>
        ) : pickups.length > 0 ? (
          pickups.map((pickup) => (
            <div
              key={pickup._id}
              className="border border-gray-300 bg-white p-4 mb-3 rounded-lg shadow-sm"
            >
              <p><strong>📍 Address:</strong> {pickup.address}</p>
              <p><strong>🗑️ Waste Type:</strong> {pickup.wasteType}</p>
              <p><strong>⚖️ Weight:</strong> {pickup.weight || "N/A"} kg</p>
              <p><strong>⚠️ Urgency:</strong> {pickup.urgency}</p>
              <p><strong>🚦 Status:</strong> {pickup.status}</p>
              {pickup.createdAt && (
                <p className="text-sm text-gray-500">
                  📅 Requested on: {new Date(pickup.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        ) : (
          <p>No pickup history found.</p>
        )}
      </div>
    </div>
  );
};

export default ResidentDashboard;
