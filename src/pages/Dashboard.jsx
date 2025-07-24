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
import LoadingSpinner from "../components/LoadingSpinner";

// El usuario se obtiene de localStorage
const navigation = [];
// Opciones de navegación del usuario
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "/" },
];

function EmptyState({ title, message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 bg-white rounded-xl shadow-inner border border-dashed border-gray-300">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className="text-sm text-gray-500 mt-2">{message}</p>
    </div>
  );
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Dashboard() {
  // Estado para almacenar los productos que llegan desde scraping
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    () => localStorage.getItem("searchTerm") || ""
  );
  const [filteredAmazon, setFilteredAmazon] = useState([]);
  const [excludedWords, setExcludedWords] = useState([]);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [searchHistory, setSearchHistory] = useState([]);
  // Estado que captura la palabra que se escribe para excluirla como filtro
  const [filterInput, setFilterInput] = useState("");

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authData");
    localStorage.removeItem("searchTerm");
    window.location.href = "/";
  };

  // useEffect(() => {

  //   // Obtener usuario actual
  //   const userData = JSON.parse(localStorage.getItem("currentUser"));

  //   if (userData && userData.id) setUserId(userData.id);
  //   if (userData && userData.name) setUserName(userData.name);
  //   // Obtener búsqueda y filtros guardados
  //   async function fetchUserData() {
  //     try {
  //       const [filtersRes, searchRes] = await Promise.all([
  //         axios.get(`http://localhost:3000/userFilters/${userData?.id || "1"}`),
  //         axios.get(`http://localhost:3000/browsingHistory/${userData?.id || "1"}`)
  //       ]);
  //       setExcludedWords(Array.isArray(filtersRes.data) ? filtersRes.data : []);
  //       setSearchHistory(Array.isArray(searchRes.data) ? searchRes.data : []);
  //       if (searchRes.data && searchRes.data.length > 0) {
  //         const last = searchRes.data[searchRes.data.length - 1];
  //         if (typeof last === 'string') setSearchTerm(last);
  //         else if (last && last.term) {
  //           setSearchTerm(last.term);
  //           if (Array.isArray(last.filters)) setExcludedWords(last.filters);
  //         }
  //       }
  //     } catch (err) {
  //       setExcludedWords([]);
  //       setSearchHistory([]);
  //     }
  //   }
  //   fetchUserData();
  // }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("currentUser"));
    if (userData && userData.id) {
      setUserId(userData.id);
      setUserName(userData.name || "");

      // Cargar filtros e historial
      async function fetchUserData() {
        try {
          const [filtersRes, searchRes] = await Promise.all([
            axios.get(`http://localhost:3000/userFilters?id=${userData.id}`),
            axios.get(
              `http://localhost:3000/browsingHistory?userId=${userData.id}`
            ),
          ]);

          if (filtersRes.data.length > 0) {
            setExcludedWords(filtersRes.data[0].filters || []);
          }
          if (searchRes.data.length > 0) {
            const lastSearch = searchRes.data[searchRes.data.length - 1];
            setSearchTerm(lastSearch.term || "");
            setExcludedWords(lastSearch.filters || []);
          }
        } catch (error) {
          console.error("Error al cargar filtros o historial", error);
        }
      }

      fetchUserData();
    }
  }, []);

  // Guardar filtros cada vez que cambian
  useEffect(() => {
    if (userId) {
      axios
        .post(`http://localhost:3000/userFilters/${userId}`, {
          filters: excludedWords,
        })
        .catch(() => {});
    }
  }, [excludedWords, userId]);

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

  useEffect(() => {
    const saveFilters = async () => {
      if (!userId) return;
      try {
        const res = await axios.get(
          `http://localhost:3000/userFilters?id=${userId}`
        );
        if (res.data.length > 0) {
          await axios.patch(
            `http://localhost:3000/userFilters/${res.data[0].id}`,
            {
              filters: excludedWords,
            }
          );
        } else {
          await axios.post(`http://localhost:3000/userFilters`, {
            id: userId,
            filters: excludedWords,
          });
        }
      } catch (error) {
        console.error("Error al guardar filtros", error);
      }
    };

    saveFilters();
  }, [excludedWords, userId]);

  // Filtra los productos de Amazon para excluir palabras
  const amazonFiltrados = filteredAmazon.filter((product) => {
    const titulo = (product.title || "").toLowerCase();
    return !excludedWords.some((palabra) => titulo.includes(palabra));
  });

  // Filtra los productos de Mercado Libre y aplica palabras excluidas
  const mercadoLibreProducts = products
    .filter((p) => p.source === "mercadolibre")
    .filter((product) => {
      const nombre = (product.name || product.title || "").toLowerCase();
      return !excludedWords.some((palabra) => nombre.includes(palabra));
    });

  // // Función que se ejecuta cuando se envía el formulario de búsqueda
  // const handleSearch = async (e) => {
  //   e.preventDefault();
  //   const term = searchTerm.trim().toLowerCase();
  //   if (!term) return;
  //   setLoading(true);
  //   try {
  //     // Scraping de Amazon y Mercado Libre en una sola petición
  //     await axios.post("http://localhost:3001/scrape", {
  //       query: term,
  //       source: ["amazon", "mercadolibre"],
  //     });
  //     // Recargar productos del backend local
  //     const res = await axios.get("http://localhost:3000/products");
  //     setProducts(res.data);
  //     // Filtrar los nuevos productos de Amazon
  //     const amazon = res.data.filter((p) => p.source === "amazon");
  //     setFilteredAmazon(
  //       amazon.filter((p) => (p.title || "").toLowerCase().includes(term))
  //     );
  //     // Guardar historial con filtros en browsingHistory
  //     if (userId && term) {
  //       try {
  //         const existing = await axios.get(
  //           `http://localhost:3000/browsingHistory?userId=${userId}&term=${term}`
  //         );

  //         if (existing.data.length > 0) {
  //           // Ya existe -> actualizar
  //           await axios.patch(
  //             `http://localhost:3000/browsingHistory/${existing.data[0].id}`,
  //             {
  //               filters: excludedWords,
  //               date: new Date().toISOString(),
  //             }
  //           );
  //         } else {
  //           // No existe -> crear
  //           await axios.post(`http://localhost:3000/browsingHistory`, {
  //             userId,
  //             term,
  //             date: new Date().toISOString(),
  //             filters: excludedWords,
  //           });
  //         }
  //       } catch (error) {
  //         console.error("❌ Error guardando historial con filtros", error);
  //       }
  //     }

  //     // Buscar si el usuario ya tiene filtros guardados para este término
  //     if (userId) {
  //       const searchRes = await axios.get(
  //         `http://localhost:3000/browsingHistory/${userId}`
  //       );
  //       if (Array.isArray(searchRes.data)) {
  //         const prev = searchRes.data.find((s) => s.term === term);
  //         if (prev && Array.isArray(prev.filters)) {
  //           setExcludedWords(prev.filters);
  //         }
  //       }
  //     }
  //   } catch (err) {
  //     // Error
  //   }
  //   setLoading(false);
  // };

  const handleSearch = async (e) => {
    e.preventDefault();
    const term = searchTerm.trim().toLowerCase();
    if (!term) return;

    setLoading(true);

    try {
      // 🔎 Scraping de Amazon y Mercado Libre en una sola petición
      await axios.post("http://localhost:3001/scrape", {
        query: term,
        source: ["amazon", "mercadolibre"],
      });

      // 🔁 Recargar productos del backend local
      const res = await axios.get("http://localhost:3000/products");
      setProducts(res.data);

      // 🔍 Filtrar productos de Amazon que coincidan con el término
      const amazon = res.data.filter((p) => p.source === "amazon");
      setFilteredAmazon(
        amazon.filter((p) => (p.title || "").toLowerCase().includes(term))
      );

      // 💾 Guardar historial con filtros en browsingHistory
      if (userId && term) {
        try {
          const existing = await axios.get(
            `http://localhost:3000/browsingHistory?userId=${userId}&term=${term}`
          );

          if (existing.data.length > 0) {
            // Ya existe → actualizar
            await axios.patch(
              `http://localhost:3000/browsingHistory/${existing.data[0].id}`,
              {
                filters: excludedWords,
                date: new Date().toISOString(),
              }
            );
          } else {
            // No existe → crear nuevo registro
            await axios.post(`http://localhost:3000/browsingHistory`, {
              userId,
              term,
              date: new Date().toISOString(),
              filters: excludedWords,
            });
          }
        } catch (error) {
          console.error("❌ Error guardando historial con filtros:", error);
        }
      }

      // 📦 Cargar filtros anteriores del historial (si existen)
      if (userId) {
        const searchRes = await axios.get(
          `http://localhost:3000/browsingHistory?userId=${userId}&term=${term}`
        );
        if (Array.isArray(searchRes.data) && searchRes.data.length > 0) {
          const prev = searchRes.data[0];
          if (Array.isArray(prev.filters)) {
            setExcludedWords(prev.filters);
          }
        }
      }
    } catch (err) {
      console.error("❌ Error general en la búsqueda:", err);
    }

    setLoading(false);
  };

  const comparadosAmazon = filteredAmazon.filter((product) => {
    const titulo = (product.title || "").toLowerCase();
    return excludedWords.every((palabra) => !titulo.includes(palabra));
  });

  const comparadosML = mercadoLibreProducts.filter((product) => {
    const nombre = (product.name || product.title || "").toLowerCase();
    return excludedWords.every((palabra) => !nombre.includes(palabra));
  });

  return (
    <>
      {/* barra de navegación */}
      <div className="min-h-full">
        <Disclosure as="nav" className="bg-blue-700 shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white text-2xl font-bold tracking-tight">
                  SmartDeal
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white font-semibold text-lg">
                  {userName}
                </span>
                <button
                  onClick={handleSignOut}
                  className="ml-4 px-4 py-2 bg-white text-blue-700 font-bold rounded shadow hover:bg-blue-100 transition"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
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
            <div className="bg-gradient-to-b from-sky-900 via-blue-900 to-indigo-900 w-full lg:w-60 rounded-xl p-4 text-white space-y-6 overflow-y-auto mb-4 lg:mb-0 shadow-lg">
              <h1 className="text-xl font-semibold mb-2">Filtros</h1>
              <div>
                <label className="block mb-1 text-blue-200 font-medium">
                  Palabras a excluir:
                </label>
                <input
                  type="text"
                  className="w-full p-2 text-gray-900 bg-white rounded mb-2 border border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400"
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.target.value)}
                  placeholder="Ej: funda, usado"
                />
                <button
                  onClick={async () => {
                    const nuevasPalabras = filterInput
                      .split(",")
                      .map((w) => w.trim().toLowerCase())
                      .filter((w) => w !== "");
                    const nuevas = [
                      ...new Set([...excludedWords, ...nuevasPalabras]),
                    ];
                    setExcludedWords(nuevas);
                    setFilterInput("");
                    // Guardar los filtros actualizados para el usuario y término actual
                    if (userId && searchTerm.trim()) {
                      await axios.post(
                        `http://localhost:3000/browsingHistory/${userId}`,
                        {
                          term: searchTerm.trim().toLowerCase(),
                          date: new Date().toISOString(),
                          filters: nuevas,
                        }
                      );
                    }
                  }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 px-2 py-2 rounded text-white w-full font-semibold shadow hover:from-blue-600 hover:to-indigo-700 transition"
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
                        className="bg-red-200 text-red-900 text-xs font-semibold px-3 py-1 rounded-full flex items-center shadow"
                      >
                        {word}
                        <button
                          onClick={() =>
                            setExcludedWords((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          className="ml-2 text-red-600 hover:text-red-800 font-bold"
                          title={`Quitar filtro: ${word}`}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => setExcludedWords([])}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-semibold shadow"
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
                      localStorage.setItem("searchTerm", e.target.value);
                    }}
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
                      <LoadingSpinner message="Buscando las mejores ofertas..." />
                    ) : comparadosAmazon.length > 0 ? (
                      comparadosAmazon.map((product, index) => {
                        const mlMatch = comparadosML.find((ml) => {
                          const mlTitle = (
                            ml.title ||
                            ml.name ||
                            ""
                          ).toLowerCase();
                          const prodTitle = (
                            product.title ||
                            product.name ||
                            ""
                          ).toLowerCase();
                          return mlTitle.includes(prodTitle.slice(0, 10));
                        });
                        let isCheapest = false;
                        if (mlMatch && mlMatch.priceCop && product.priceCop) {
                          isCheapest = product.priceCop < mlMatch.priceCop;
                        }
                        return (
                          <div
                            key={index}
                            className={`relative bg-white shadow-lg rounded-xl p-4 text-left border-2 ${
                              isCheapest
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            } transition-all flex flex-col gap-2`}
                          >
                            {isCheapest && (
                              <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow">
                                Más barato
                              </span>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <svg
                                className="w-6 h-6 text-indigo-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M3 7v4a1 1 0 001 1h3v6a1 1 0 001 1h8a1 1 0 001-1v-6h3a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1z" />
                              </svg>
                              <span className="font-semibold text-lg text-gray-800 truncate">
                                {product.title}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-green-600 font-bold text-xl">
                                {product.price}
                              </span>
                              <span className="text-xs text-gray-400">
                                {product.priceCop
                                  ? product.priceCop.toLocaleString("es-CO", {
                                      style: "currency",
                                      currency: "COP",
                                    })
                                  : "N/A"}
                              </span>
                            </div>
                            <a
                              href={product.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-block text-blue-600 hover:underline text-sm font-medium"
                            >
                              Ver en Amazon
                            </a>
                          </div>
                        );
                      })
                    ) : (
                      // <p className="text-center text-gray-500">Sin productos de Amazon</p>
                      <EmptyState
                        title="No hay productos de Amazon"
                        message="Intenta otra búsqueda o revisa tus filtros."
                      />
                    )}
                  </div>
                  {/* Mercado Libre */}
                  <div className="space-y-4">
                    {loading ? (
                      <LoadingSpinner message="Buscando las mejores ofertas..." />
                    ) : comparadosML.length > 0 ? (
                      comparadosML.map((product, index) => {
                        const amazonMatch = comparadosAmazon.find((amz) => {
                          const amzTitle = (
                            amz.title ||
                            amz.name ||
                            ""
                          ).toLowerCase();
                          const prodTitle = (
                            product.title ||
                            product.name ||
                            ""
                          ).toLowerCase();
                          return amzTitle.includes(prodTitle.slice(0, 10));
                        });
                        let isCheapest = false;
                        if (
                          amazonMatch &&
                          amazonMatch.priceCop &&
                          product.priceCop
                        ) {
                          isCheapest = product.priceCop < amazonMatch.priceCop;
                        }
                        return (
                          <div
                            key={index}
                            className={`relative bg-white shadow-lg rounded-xl p-4 text-left border-2 ${
                              isCheapest
                                ? "border-green-500 bg-green-50"
                                : "border-gray-200"
                            } transition-all flex flex-col gap-2`}
                          >
                            {isCheapest && (
                              <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold shadow">
                                Más barato
                              </span>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <svg
                                className="w-6 h-6 text-yellow-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M8 12h8M12 8v8" />
                              </svg>
                              <span className="font-semibold text-lg text-gray-800 truncate">
                                {product.name || product.title}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-green-600 font-bold text-xl">
                                {product.price}
                              </span>
                              <span className="text-xs text-gray-400">
                                {product.priceCop
                                  ? product.priceCop.toLocaleString("es-CO", {
                                      style: "currency",
                                      currency: "COP",
                                    })
                                  : "N/A"}
                              </span>
                            </div>
                            {product.link && (
                              <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block text-blue-600 hover:underline text-sm font-medium"
                              >
                                Ver en Mercado Libre
                              </a>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <EmptyState
                        title="No hay productos de Mercado Libre"
                        message="Prueba eliminar filtros o busca otro producto."
                      />
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
