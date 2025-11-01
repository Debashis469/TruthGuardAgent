function Services() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-blue-900 mb-8">Our Services</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <h2 className="font-bold text-xl text-blue-700 mb-2">WhatsApp Verification</h2>
          <p className="text-gray-700 mb-4">Use our WhatsApp bot for easy fact-checking within chats.</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <h2 className="font-bold text-xl text-blue-700 mb-2">Telegram Bot</h2>
          <p className="text-gray-700 mb-4">Verify claims right inside Telegram groups or private messages.</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <h2 className="font-bold text-xl text-blue-700 mb-2">Browser Extension</h2>
          <p className="text-gray-700 mb-4">Highlight and fact-check information on any website instantly.</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow text-center">
          <h2 className="font-bold text-xl text-blue-700 mb-2">Desktop App</h2>
          <p className="text-gray-700 mb-4">Standalone desktop solution for batch or deep verification.</p>
        </div>
      </div>
    </div>
  );
}
export default Services;
