import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

export default function ErrorPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-white min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20">
        <p className="font-bold text-indigo-600 text-7xl mb-4">404</p>
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
        <p className="text-base md:text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          Lo sentimos, no pudimos encontrar la página que buscas.
        </p>
        <Link to="/" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition shadow">Volver al inicio</Link>
      </main>
      <Footer />
    </div>
  );
}