import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const InactiveCollectors = () => {
  const [collectors, setCollectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalCollectors = 10; // Replace with actual total if available
  const activeCount = totalCollectors - collectors.length;

  const data = [
    { name: "Active", value: activeCount },
    { name: "Inactive", value: collectors.length },
  ];

  const COLORS = ["#34d399", "#f87171"];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${data[index].name} - ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  useEffect(() => {
    const fetchInactiveCollectors = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Token not found. Please login again.");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          "https://zerowastex-smart-waste-disposal-system.onrender.com/api/admin/inactive-collectors",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCollectors(res.data.inactiveCollectors);
      } catch (err) {
        console.error("Error fetching inactive collectors:", err);
        setError("Failed to fetch data. Make sure you're logged in as admin.");
      } finally {
        setLoading(false);
      }
    };

    fetchInactiveCollectors();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-6 text-blue-500 font-semibold">
        Loading inactive collectors...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-6 text-red-500 font-semibold">{error}</div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mt-6 ">
      <h2 className="text-xl font-boldmb-4">
        🛑 Inactive Collectors (No Pickups in 7+ Days)
      </h2>
      <div className="flex justify-center mb-6">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              labelLine={false}
              label={renderCustomizedLabel}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {collectors.length === 0 ? (
        <div className="flex items-center gap-2 text-green-400 font-medium text-sm">
          ✅ All collectors are active
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {collectors.map((collector) => (
            <div
              key={collector._id}
              className=" p-4 rounded-lg border border-gray-700 shadow-sm"
            >
              <p className="text-base font-semibold">{collector.name}</p>
              <p className="text-sm text-gray-400">{collector.email}</p>
              <p className="text-xs text-red-500 mt-1">Inactive for 7+ days</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InactiveCollectors;
