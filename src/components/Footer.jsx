function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-bold text-lg">SmartDeal</span>
        <span className="text-sm">&copy; {new Date().getFullYear()} Todos los derechos reservados.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:text-yellow-300 transition">Términos</a>
          <a href="#" className="hover:text-yellow-300 transition">Privacidad</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
