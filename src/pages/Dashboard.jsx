
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useEffect, useState } from "react";

// Objeto de ejemplo para representar al usuario logueado
const user = {
  name: "Tom Cook",
  email: "tom@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
};
const navigation = [];
// Opciones de navegación del usuario
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "/" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Dashboard() {
  // Estado para almacenar los productos que llegan desde scraping
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(() => localStorage.getItem("searchTerm") || "");
  const [filteredAmazon, setFilteredAmazon] = useState([]);
  const [excludedWords, setExcludedWords] = useState([]);
    // Estado que captura la palabra que se escribe para excluirla como filtro
  const [filterInput, setFilterInput] = useState("");

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authData");
    localStorage.removeItem("searchTerm");

    window.location.href = "/login"
  };

  useEffect(() => {
    // Función asíncrona que se encarga de obtener los productos desde el backend
    async function fetchProducts() {
      try {
        const res = await axios.get("http://localhost:3000/products");
        setProducts(res.data);
        // Filtra solo los productos provenientes de Amazon y los guarda por separado
        setFilteredAmazon(res.data.filter((p) => p.source === "amazon"));

        setLoading(false);
      } catch (err) {
        console.error("Error fetching products:", err);
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);



   // Filtra los productos de Amazon para excluir palabras
  const amazonFiltrados = filteredAmazon.filter(product => {
    const titulo = (product.title || "").toLowerCase();
    return !excludedWords.some(palabra => titulo.includes(palabra));
  });

  // Filtra los productos de Mercado Libre y aplica palabras excluidas
    const mercadoLibreProducts = products
    .filter((p) => p.source === "mercadolibre")
    .filter(product => {
      const nombre = (product.name || product.title || '').toLowerCase();
      return !excludedWords.some(palabra => nombre.includes(palabra));
    });

  // Función que se ejecuta cuando se envía el formulario de búsqueda
  const handleSearch = async (e) => {
  e.preventDefault();
  const term = searchTerm.trim().toLowerCase();
  if (!term) return;

  setLoading(true);

  try {
    // Scraping de Amazon y Mercado Libre en una sola petición
    await axios.post("http://localhost:3001/scrape", { query: term, source: ["amazon", "mercadolibre"] });

    // Recargar productos del backend local
    const res = await axios.get("http://localhost:3000/products");
    setProducts(res.data);

    // Filtrar los nuevos productos de Amazon
    const amazon = res.data.filter((p) => p.source === "amazon");
    setFilteredAmazon(
      amazon.filter((p) => (p.title || "").toLowerCase().includes(term))
    );

  } catch (err) {
    console.error("Error durante scraping o carga:", err);
    alert("Error al buscar productos");
  } finally {
    setLoading(false);
  }
};


  return (

    <>
      {/* barra de navegación */}
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-gray-800">

          <div className=" max-w-8xl px-4 pr-[50px]">

            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="shrink-0">
                  <img
                    alt="Your Company"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                    className="size-8"
                  />
                </div>
                <div className="hidden md:block">

                  <div className=""></div>

                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-4 flex items-center md:ml-6">
                  <button
                    type="button"
                    className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                  >
                    <span className="absolute -inset-1.5" />
                    <span className="sr-only">View notifications</span>
                    <BellIcon aria-hidden="true" className="size-6" />
                  </button>

                  {/* Menú desplegable */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <MenuButton className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800">
                        <span className="absolute -inset-1.5" />
                        <span className="sr-only">Open user menu</span>

                        <img
                          alt=""
                          src={user.imageUrl}
                          className="size-8 rounded-full"
                        />

                      </MenuButton>
                    </div>
                    <MenuItems
                      transition
                      className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                    >
                      {userNavigation.map((item) => (
                        <MenuItem key={item.name}>
                        {item.name === "Sign out" ? (
                          <button
                            onClick={handleSignOut}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {item.name}
                          </button>
                        ) : (
                          <a
                            href={item.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {item.name}
                          </a>
                        )}
                      </MenuItem>

                      ))}
                    </MenuItems>
                  </Menu>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                {/* Botón de menú móvil */}
                <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>

                  <Bars3Icon
                    aria-hidden="true"
                    className="block size-6 group-data-open:hidden"
                  />
                  <XMarkIcon
                    aria-hidden="true"
                    className="hidden size-6 group-data-open:block"
                  />

                </DisclosureButton>
              </div>
            </div>
          </div>

          <DisclosurePanel className="md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}

                  aria-current={item.current ? "page" : undefined}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"

                  )}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-4 pb-3">
              <div className="flex items-center px-5">
                <div className="shrink-0">

                  <img
                    alt=""
                    src={user.imageUrl}
                    className="size-10 rounded-full"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base/5 font-medium text-white">
                    {user.name}
                  </div>
                  <div className="text-sm font-medium text-gray-400">
                    {user.email}
                  </div>

                </div>
                <button
                  type="button"
                  className="relative ml-auto shrink-0 rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                >
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <BellIcon aria-hidden="true" className="size-6" />
                </button>
              </div>
              <div className="mt-3 space-y-1 px-2">
                {userNavigation.map((item) =>
                  item.name === "Sign out" ? (
                    <button
                      key={item.name}
                      onClick={handleSignOut}
                      className="block w-full text-left rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {item.name}
                    </button>
                  ) : (
                    <DisclosureButton
                      key={item.name}
                      as="a"
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                    >
                      {item.name}
                    </DisclosureButton>
                  )
                )}
              </div>

            </div>
          </DisclosurePanel>
        </Disclosure>

        <header className="bg-white shadow-sm">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Productos
            </h1>
          </div>
        </header>
        <main>
          <div className="flex flex-col lg:flex-row px-2 sm:px-4 lg:px-8 py-4 sm:py-6 gap-4">
            {/* Barra lateral de filtros */}
            <div className="bg-sky-900 w-full lg:w-60 rounded-xl p-4 text-white space-y-6 overflow-y-auto mb-4 lg:mb-0">
            <h1 className="text-xl font-semibold mb-2">Filtros</h1>

            <div>
              <label className="block mb-1">Palabras a excluir:</label>
              <input
                type="text"
                className="w-full p-1 text-black rounded mb-2"
                value={filterInput}
                onChange={(e) => setFilterInput(e.target.value)} // Actualiza el estado al escribir
                placeholder="Ej: funda, usado"
              />
              <button
                onClick={() => {
                   // Divide el texto por comas, limpia espacios y convierte a minúsculas
                  const nuevasPalabras = filterInput
                    .split(",")
                    .map(w => w.trim().toLowerCase())
                    .filter(w => w !== "");

                     // Actualiza el estado de palabras excluidas evitando duplicados (Set)
                  setExcludedWords(prev => [...new Set([...prev, ...nuevasPalabras])]);
                  setFilterInput("");
                }}
                className="bg-sky-500 px-2 py-1 rounded text-white w-full"
              >
                Aplicar filtro
              </button>
            </div>

            {/* Palabras excluidas visuales */}
            {excludedWords.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2">
                {excludedWords.map((word, index) => (
                  <span
                    key={index}
                    className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                  >
                    {word}
                     {/* Botón para quitar una palabra específica del filtro */}
                    <button
                      onClick={() =>
                        setExcludedWords((prev) => prev.filter((_, i) => i !== index)) // elimina un elemento del arreglo excludedWords según su posición
                      }
                      className="ml-1 text-red-500 hover:text-red-700"
                      title={`Quitar filtro: ${word}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              {/* Botón para limpiar todos los filtros */}
              <button
                onClick={() => setExcludedWords([])}
                className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm"
              >
                Limpiar todos los filtros
              </button>
            </div>
          )}
          </div>


            {/* Contenido de productos */}
            <div className="flex flex-col w-full">
              <form onSubmit={handleSearch} className="mb-4">
                <label
                  htmlFor="default-search"
                  className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                >
                  Search
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="search"
                    id="default-search"
                    className="block w-full p-4 ps-10 text-sm border border-gray-300 rounded-lg"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => {
                    setSearchTerm(e.target.value);
                    localStorage.setItem("searchTerm", e.target.value);}}
                  />
                  <button
                    type="submit"
                    className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
                  >
                    Buscar
                  </button>
                </div>
              </form>

              {/* Empresas */}
              <div className="grid grid-cols-2 gap-6 text-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Amazon</h2>
                <h2 className="text-2xl font-bold text-gray-800">
                  Mercado Libre
                </h2>
              </div>

              <div className="h-[400px] sm:h-[580px] overflow-y-auto p-2 sm:p-4 rounded-xl bg-neutral-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Amazon */}
                  <div className="space-y-4">
                    {loading ? (
                      <p className="text-center">Cargando productos...</p>
                    ) : filteredAmazon.length > 0 ? (
                      amazonFiltrados.map((product, index) => (
                        <div
                          key={index}
                          className="bg-white shadow rounded-xl p-4 text-center"
                        >
                          <p className="text-gray-700 font-medium">
                            {product.title}
                          </p>
                          <p className="text-green-600 font-semibold">
                            {product.price}
                          </p>
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            Ver en Amazon
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">
                        Sin productos de Amazon
                      </p>
                    )}
                  </div>

                  {/* Mercado Libre */}
                  <div className="space-y-4">
                    {loading ? (
                      <p className="text-center">Cargando productos...</p>
                    ) : mercadoLibreProducts.length > 0 ? (
                      mercadoLibreProducts.map((product, index) => (
                        <div
                          key={index}
                          className="bg-white shadow rounded-xl p-4 text-center"
                        >
                          <p className="text-gray-700 font-medium">
                            {product.name || product.title}
                          </p>
                          <p className="text-green-600 font-semibold">
                            {product.price}
                          </p>
                          {product.link && (
                            <a
                              href={product.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-all"
                            >
                              Ver en Mercado Libre
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500">
                        Sin productos de Mercado Libre
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );

}
