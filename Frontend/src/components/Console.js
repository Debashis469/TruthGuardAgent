import { useState } from "react";
import api from "../api/api";
import ResultCard from "./ResultCard";

function Console() {
  const [text, setText] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);
    try {
      const res = await api.post("/verify", { text });
      setResults(res.data);
    } catch (err) {
      setResults({ error: "Verification failed, try again." });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-3 text-blue-800">Verification Console</h2>
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          className="w-full h-32 p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 ring-blue-400"
          placeholder="Paste news, tweets, or any text to verify..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded mt-3 font-semibold"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Check Facts"}
        </button>
      </form>
      {results && <ResultCard results={results} />}
    </div>
  );
}

export default Console;
