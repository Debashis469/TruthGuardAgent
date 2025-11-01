function ResultCard({ results }) {
  if (results.error) return <div className="text-red-600 font-semibold">{results.error}</div>;
  return (
    <div className="bg-white rounded shadow p-6 mt-4 border border-blue-100">
      <h3 className="font-bold text-blue-700 text-xl mb-2">Verdict: <span className="text-black">{results.verdict}</span></h3>
      <p className="text-gray-600 mb-2">Confidence: <span className="font-semibold">{results.confidence}%</span></p>
      <div>
        <span className="font-semibold text-gray-700">Evidence:</span>
        <ul className="list-disc ml-6">
          {results.evidence?.map((item, i) => (
            <li key={i} className="text-gray-700">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ResultCard;
