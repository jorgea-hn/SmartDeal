import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen flex flex-col">
      <Header />
      {/* Hero minimalista */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 pt-20 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          SmartDeal
        </h1>
        <p className="text-base md:text-xl text-gray-600 mb-8 max-w-xl mx-auto">
          Encuentra y compara los mejores precios de Amazon en segundos. Simple, rápido y sin complicaciones.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition">Regístrate</Link>
          <Link to="/login" className="bg-white border border-indigo-600 text-indigo-700 font-semibold py-2 px-6 rounded-lg transition">Iniciar sesión</Link>
        </div>
      </section>

      {/* Beneficios minimalistas */}
      <section className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-3xl mb-2 text-indigo-600">💸</span>
          <h3 className="font-semibold mb-1">Ahorra dinero</h3>
          <p className="text-gray-500 text-sm text-center">Compara precios y encuentra ofertas reales.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-3xl mb-2 text-indigo-600">⚡</span>
          <h3 className="font-semibold mb-1">Rápido y fácil</h3>
          <p className="text-gray-500 text-sm text-center">Resultados instantáneos, sin registros complicados.</p>
        </div>
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center">
          <span className="text-3xl mb-2 text-indigo-600">🔒</span>
          <h3 className="font-semibold mb-1">Seguro</h3>
          <p className="text-gray-500 text-sm text-center">Tus datos protegidos y compras confiables.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}