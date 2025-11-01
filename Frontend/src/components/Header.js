import { Link, useLocation } from "react-router-dom";

function Header() {
  const { pathname } = useLocation();
  const linkClass = (path) =>
    (pathname === path ? "font-bold underline" : "hover:underline") + " transition";

  return (
    <nav className="bg-gray-950 text-white px-6 py-3 shadow flex justify-between items-center sticky top-0 z-10">
      <span className="font-bold text-xl tracking-widest">TruthGuard</span>
      <div className="flex space-x-5 text-lg">
        <Link className={linkClass("/")} to="/">Home</Link>
        <Link className={linkClass("/services")} to="/services">Services</Link>
        <Link className={linkClass("/playground")} to="/playground">Playground</Link>
        <Link className={linkClass("/about")} to="/about">About Us</Link>
        <Link className={linkClass("/console")} to="/console">Console</Link>
        <Link className={linkClass("/dashboard")} to="/dashboard">Dashboard</Link>
        <Link className={linkClass("/history")} to="/history">History</Link>
        <Link className={linkClass("/login")} to="/login">Login</Link>
      </div>
    </nav>
  );
}
export default Header;
