import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Landing from "./components/Landing";
import Services from "./pages/Services";
import Playground from "./pages/Playground";
import About from "./pages/About";
import Console from "./components/Console";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import SessionHistory from "./components/SessionHistory";
import Login from "./components/Login";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/services" element={<Services />} />
        <Route path="/playground" element={<Playground />} />
        <Route path="/about" element={<About />} />
        <Route path="/console" element={<Console />} />
        <Route path="/dashboard" element={<AnalyticsDashboard />} />
        <Route path="/history" element={<SessionHistory />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
