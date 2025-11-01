function Playground() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-blue-900 mb-6">Playground: Try TruthGuard</h1>
      <p className="mb-6 text-gray-700">
        Paste any claim, news, or social message to see how our agent verifies information. Try different formats and languages!
      </p>
      <div className="bg-gray-50 rounded-xl shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">How to Use</h2>
        <ol className="list-decimal pl-6 text-gray-800 font-medium">
          <li>Enter text/content to be verified in the playground box below.</li>
          <li>Click <span className="bg-blue-200 px-2 rounded">Verify</span>.</li>
          <li>See the verdict, confidence, and supporting evidence instantly.</li>
        </ol>
      </div>
      <div className="bg-white rounded-xl p-8 shadow">
        {/* Optionally embed the Console component for live demo */}
        <p className="text-center text-gray-500">Embed Console component here for demo UI if needed.</p>
      </div>
    </div>
  );
}
export default Playground;
