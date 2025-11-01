import { useEffect, useState } from "react";
import api from "../api/api";

function SessionHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.get("/history").then(res => setHistory(res.data));
  }, []);

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold mb-4 text-blue-800">Session History</h2>
      <ul className="space-y-4">
        {history.map((item, i) => (
          <li key={i} className="bg-white rounded shadow p-4 border border-blue-100">
            <p className="font-semibold text-gray-700">{item.query}</p>
            <p className="text-sm text-gray-600">Result: {item.verdict} | {item.timestamp}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SessionHistory;
