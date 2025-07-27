import { renderRoute } from "../routers/router";

window.addEventListener("DOMContentLoaded", 
    
  document.addEventListener("click", (e) => {
  const link = e.target.matches("[data-link]");
  if (link) {
    e.preventDefault(); // Evita la recarga de página
    history.pushState(null, null, e.target.href); // Cambia la URL sin recargar
    renderRoute(); // Renderiza la vista correspondiente
  }
}));
window.addEventListener("popstate", renderRoute);

window.addEventListener("load", renderRoute)


