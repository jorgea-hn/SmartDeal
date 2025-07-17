import axios from 'axios';

// 🔧 Referencias a elementos del DOM
const productsContainer = document.getElementById("productsContainer"); // Contenedor donde se mostrarán los productos
const searchInput = document.getElementById("searchInput");             // Input para ingresar el término de búsqueda
const searchButton = document.getElementById("searchButton");           // Botón para iniciar la búsqueda
const filterInput = document.getElementById("filterInput");             // Input para ingresar palabras a excluir
const filterButton = document.getElementById("filterButton");           // Botón para aplicar el filtro de exclusión

// 📦 Contenedor dinámico para mostrar las etiquetas de palabras excluidas
const filterTagsContainer = document.createElement("div");
filterTagsContainer.id = "filterTagsContainer";
// Inserta las etiquetas justo debajo del input de exclusión
filterInput.parentNode.insertBefore(filterTagsContainer, filterInput.nextSibling);

// 🧠 Variables globales
let currentSearchTerm = ""; // Guarda el término actual de búsqueda
let allProducts = [];       // Guarda todos los productos obtenidos del backend

// 📥 Carga los productos desde json-server (db.json)
async function loadProductsFromDB() {
  try {
    const res = await axios.get("http://localhost:3000/products");
    allProducts = res.data;
  } catch (err) {
    console.error("Error cargando productos:", err);
    productsContainer.innerHTML = "<p>Error al cargar productos</p>";
  }
}

// 🖼️ Renderiza los productos en tarjetas HTML
function renderProducts(products) {
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML = "<p>No hay productos disponibles</p>";
    return;
  }

  products.forEach(p => {
    const card = document.createElement("div");
    card.classList.add("card"); // Aplica estilos con CSS
    card.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.price || 'Sin precio'}</p>
      <a href="${p.link}" target="_blank" rel="noopener noreferrer">Ver en Amazon</a>
    `;
    productsContainer.appendChild(card);
  });
}

// 🏷️ Muestra etiquetas visuales para las palabras excluidas con opción de eliminarlas
function renderFilterTags(filters = []) {
  filterTagsContainer.innerHTML = "";

  filters.forEach((word, index) => {
    const tag = document.createElement("button");
    tag.className = "filter-tag";
    tag.innerHTML = `${word} <span data-index="${index}">❌</span>`;

    // Eliminar filtro al hacer clic en ❌
    tag.querySelector("span").addEventListener("click", async (e) => {
      e.stopPropagation(); // Previene eventos adicionales
      const newFilters = [...filters];
      newFilters.splice(index, 1); // Quita el filtro de la lista

      try {
        // Buscar entrada del historial correspondiente al término actual
        const historyRes = await axios.get("http://localhost:3000/browsingHistory");
        const entry = historyRes.data.find(h => h.term === currentSearchTerm);
        if (!entry) return;

        // Actualiza el filtro en el historial
        await axios.patch(`http://localhost:3000/browsingHistory/${entry.id}`, {
          filter: newFilters
        });

        // Vuelve a renderizar los productos filtrados
        await renderFilteredProducts();
      } catch (err) {
        console.error("Error actualizando filtros:", err);
      }
    });

    filterTagsContainer.appendChild(tag);
  });
}

// 🔍 Aplica los filtros y muestra los productos que no contienen palabras excluidas
async function renderFilteredProducts() {
  try {
    const [historyRes] = await Promise.all([
      axios.get("http://localhost:3000/browsingHistory")
    ]);

    const entry = historyRes.data.find(h => h.term === currentSearchTerm);
    const filters = entry?.filter || [];

    renderFilterTags(filters);

    // Filtra productos que no contengan ninguna palabra excluida
    const filtered = allProducts.filter(p => {
      const title = p.title.toLowerCase();
      return !filters.some(f => title.includes(f.toLowerCase()));
    });

    renderProducts(filtered);
  } catch (err) {
    console.error("Error mostrando productos:", err);
  }
}

// 🔍 Evento al hacer clic en "Buscar"
searchButton.addEventListener("click", async () => {
  const searchTerm = searchInput.value.trim();
  if (!searchTerm) return;

  currentSearchTerm = searchTerm;

  // Desactiva botón temporalmente mientras hace scraping
  searchButton.disabled = true;
  searchButton.textContent = "Buscando...";

  try {
    // Envia petición al backend de scraping (Node.js)
    await axios.post("http://localhost:3001/scrape", { query: searchTerm });

    // Recarga productos desde json-server
    await loadProductsFromDB();

    // Aplica los filtros actuales
    await renderFilteredProducts();
  } catch (err) {
    console.error("Error scraping:", err);
    alert("Error durante scraping");
  } finally {
    searchButton.disabled = false;
    searchButton.textContent = "Buscar";
  }
});

// 🧹 Evento al hacer clic en "Filtrar"
filterButton.addEventListener("click", async () => {
  const rawWords = filterInput.value.trim();
  if (!rawWords || !currentSearchTerm) return;

  // Separa palabras por comas y limpia espacios
  const wordsToAdd = rawWords.split(",").map(w => w.trim()).filter(Boolean);

  try {
    // Obtiene entrada del historial para este término
    const historyRes = await axios.get("http://localhost:3000/browsingHistory");
    const entry = historyRes.data.find(h => h.term === currentSearchTerm);
    if (!entry) return;

    // Agrega nuevas palabras sin duplicados
    const newFilter = Array.from(new Set([...(entry.filter || []), ...wordsToAdd]));

    // Actualiza entrada del historial
    await axios.patch(`http://localhost:3000/browsingHistory/${entry.id}`, {
      filter: newFilter
    });

    filterInput.value = "";
    await renderFilteredProducts();
  } catch (err) {
    console.error("Error actualizando filtros:", err);
  }
});

// 🚀 Al cargar la página, obtiene productos y los muestra
(async () => {
  await loadProductsFromDB();
  renderProducts(allProducts);
})();
