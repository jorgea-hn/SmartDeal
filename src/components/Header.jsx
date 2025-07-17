import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-500 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">SmartDeal</span>
        </Link>
        <nav className="flex gap-6">
          <Link to="/" className="text-white font-semibold hover:text-yellow-300 transition">Inicio</Link>
          <Link to="/login" className="text-white font-semibold hover:text-yellow-300 transition">Iniciar sesión</Link>
          <Link to="/register" className="text-white font-semibold hover:text-yellow-300 transition">Registrarse</Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
