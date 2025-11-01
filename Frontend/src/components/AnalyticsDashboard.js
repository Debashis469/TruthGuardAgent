import { useEffect, useState } from "react";
import api from "../api/api";

function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/analytics").then(res => setStats(res.data));
  }, []);

  if (!stats) return <div className="p-8">Loading Analytics...</div>;
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-6 text-blue-800">Analytics Dashboard</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded shadow border border-blue-100">
          <div className="text-sm text-gray-500 mb-1">Total Verifications</div>
          <div className="text-2xl font-bold">{stats.total_verifications}</div>
        </div>
        <div className="bg-white p-6 rounded shadow border border-blue-100">
          <div className="text-sm text-gray-500 mb-1">Accuracy</div>
          <div className="text-2xl font-bold">{stats.accuracy}%</div>
        </div>
        {/* More analytics cards */}
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
