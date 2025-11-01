function Landing() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-100 to-blue-200">
      <h1 className="text-5xl font-extrabold mb-6 text-blue-800 tracking-tight">TruthGuard Agent Platform</h1>
      <p className="max-w-xl mb-8 text-center text-lg font-medium text-gray-800">
        AI-powered fact verification across web, WhatsApp, Telegram, and desktop. Verify claims instantly with confidence and evidence, all powered by modern cloud and open-source tech!
      </p>
      <div className="mb-8 text-center">
        <span className="font-bold text-blue-900">Tech Stack:</span>
        <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm">
          <span className="bg-blue-100 text-blue-800 rounded px-3 py-1">React</span>
          <span className="bg-yellow-100 text-yellow-800 rounded px-3 py-1">Tailwind CSS</span>
          <span className="bg-purple-100 text-purple-800 rounded px-3 py-1">Flask Backend</span>
          <span className="bg-green-100 text-green-800 rounded px-3 py-1">AI ADK Agent</span>
          <span className="bg-blue-100 text-blue-800 rounded px-3 py-1">WhatsApp API</span>
          <span className="bg-blue-800 text-white rounded px-3 py-1">Telegram Bot</span>
          <span className="bg-gray-200 text-gray-800 rounded px-3 py-1">Browser Extension</span>
        </div>
      </div>
      <a href="/console" className="bg-blue-700 py-3 px-8 text-white rounded hover:bg-blue-800 text-lg font-semibold shadow transition-all">
        Try Fact Checking Console
      </a>
    </section>
  );
}
export default Landing;
