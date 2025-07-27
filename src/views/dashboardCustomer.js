import { showAlert } from "../scripts/sweetAlerts";

export let renderDashboardCustomer = (main, ul) => {
  main.innerHTML = `
    <section id="section-main">
      <section class="container">
        <input type="text" id="mainSearch" placeholder="Buscar algo..." />
        <button id="searchBtn">Buscar</button>
        <div id="columnsContainer">
          <div id="amazonColumn">
            <h2>Amazon</h2>
            <div class="productsColumn" id="amazonProducts"></div>
          </div>
          <div id="mercadoColumn">
            <h2>Mercado Libre</h2>
            <div class="productsColumn" id="mercadoProducts"></div>
          </div>
        </div>
      </section>
      <aside>
        <input type="text" id="miniSearch" placeholder="Mini búsqueda" />
        <button id="filterBtn">Filter</button>
        <div id="filtersList"></div>
      </aside>
    </section>
  `;

  ul.innerHTML = `<a href="/login" id="log-out" class="btn primary" data-link>Log out</a>`;
  document.getElementById("log-out").addEventListener("click", e => {
    e.preventDefault();
    localStorage.removeItem("user");
    window.history.pushState(null, null, "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });

  let currentSearchTerm = '';
  let currentFilters = [];

  const getUserFromStorage = () => {
    try {
      const stored = localStorage.getItem("user");
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed[0] : parsed;
    } catch {
      return null;
    }
  };

  const renderColumn = (containerId, products = []) => {
    const container = document.getElementById(containerId);
    const filtered = products.filter(p =>
      !currentFilters.some(f => p.title?.toLowerCase().includes(f.toLowerCase()))
    );
    container.innerHTML = filtered.length === 0
      ? "<p>No se encontraron productos.</p>"
      : filtered.map(p => `
        <div class="product-card">
          <h3>${p.title || "Sin título"}</h3>
          <p>Precio: ${p.price || "No disponible"}</p>
          ${p.link ? `<p><a href="${p.link}" target="_blank">Ver producto</a></p>` : ""}
        </div>
      `).join('');
  };

  const renderFilters = filters => {
    const filtersList = document.getElementById("filtersList");
    filtersList.innerHTML = filters.map(f => `
      <span class="filter-tag" data-filter="${f}">${f} ✖</span>
    `).join('');
    document.querySelectorAll(".filter-tag").forEach(tag => {
      tag.addEventListener("click", async () => {
        currentFilters = currentFilters.filter(f => f !== tag.dataset.filter);
        await updateFilters();
      });
    });
  };

  const updateFilters = async () => {
    const user = getUserFromStorage();
    if (!user?.id || !currentSearchTerm) return;

    await fetch("http://localhost:3001/searchingHistory/filter", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        term: currentSearchTerm,
        platform: 'both',
        filter: currentFilters
      })
    });

    const results = await Promise.all(
      ['amazon', 'mercado'].map(platform =>
        fetch(`http://localhost:3001/products?userId=${user.id}&platform=${platform}`)
          .then(res => res.json())
          .then(({ products }) => [platform, products])
      )
    );

    results.forEach(([platform, products]) => {
      const id = platform === 'amazon' ? 'amazonProducts' : 'mercadoProducts';
      renderColumn(id, products);
    });

    renderFilters(currentFilters);
  };

  document.getElementById("searchBtn").addEventListener("click", async () => {
    const searchTerm = document.getElementById("mainSearch").value.trim();
    const user = getUserFromStorage();
    if (!user?.id) {
      showAlert("⚠️ No hay usuario logueado", "error");
      return;
    }
    if (!searchTerm) {
      showAlert("⚠️ Escribe algo para buscar.", "error");
      return;
    }

    currentSearchTerm = searchTerm;
    currentFilters = [];
    document.getElementById("searchBtn").disabled = true;
    showAlert("🔄 Buscando en Amazon y Mercado Libre...", "success");

    // Ejecutar scrapes en paralelo
    await Promise.all(['amazon', 'mercado'].map(async platform => {
      const res = await fetch("http://localhost:3001/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchTerm, userId: user.id, platform })
      });
      const result = await res.json();
      if (!res.ok) showAlert(`❌ ${platform}: ${result.error}`, "error");
    }));

    // Recoger resultados por plataforma
    await Promise.all(['amazon', 'mercado'].map(async platform => {
      const res = await fetch(`http://localhost:3001/products?userId=${user.id}&platform=${platform}`);
      const { products } = await res.json();
      const containerId = platform === 'amazon' ? 'amazonProducts' : 'mercadoProducts';
      renderColumn(containerId, products);
    }));

    renderFilters(currentFilters);
    document.getElementById("searchBtn").disabled = false;
  });

  document.getElementById("filterBtn").addEventListener("click", async () => {
    const value = document.getElementById("miniSearch").value.trim();
    if (value && !currentFilters.includes(value)) {
      currentFilters.push(value);
      document.getElementById("miniSearch").value = "";
      await updateFilters();
    }
  });

  const loadLastSearch = async () => {
    const user = getUserFromStorage();
    if (!user?.id) return;

    const historyRes = await fetch("http://localhost:3001/history");
    const history = await historyRes.json();

    for (const platform of ['amazon', 'mercado']) {
      const entry = history
        .filter(h => h.userId === user.id && h.platform === platform)
        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      if (entry) {
        currentSearchTerm = entry.term;
        currentFilters = entry.filter || [];
        document.getElementById("mainSearch").value = entry.term;

        const res = await fetch(`http://localhost:3001/products?userId=${user.id}&platform=${platform}`);
        const { products } = await res.json();
        const containerId = platform === 'amazon' ? 'amazonProducts' : 'mercadoProducts';
        renderColumn(containerId, products);
      }
    }

    renderFilters(currentFilters);
  };

  loadLastSearch();
};










