import { renderHome } from "../views/home";
import { renderLogin } from "../views/login";
import { renderRegister } from "../views/register";
import { renderDashboardAdmin } from "../views/dashboardAdmin";
import { renderDashboardCustomer } from "../views/dashboardCustomer";
import { local_ } from "../scripts/localstorage";
let $main = document.getElementById('main');
let $ul = document.getElementById('ul');
let routes = {
  "/home": () => renderHome($main, $ul),
  "/login": () => renderLogin($main, $ul),
  "/register": () => renderRegister($main, $ul),
  "/dashboardAdmin": () => renderDashboardAdmin($main, $ul),
  "/dashboardCustomer": () => renderDashboardCustomer($main, $ul)
}

export let renderRoute = () => {
  let path = window.location.pathname;
  const userRedirect = local_.dashboard();
  let local = localStorage.getItem('user')
  if (userRedirect && local) {
    // Redirige SIN recargar y renderiza dinámicamente
    if (path !== userRedirect) {
      window.history.pushState(null, null, userRedirect);
      path = window.location.pathname;
    }
  } else if (path === "/" || path === "") {
    path = "/home";
    window.history.replaceState(null, null, path);
  }
  path = window.location.pathname;
  const routeFn = routes[path];
  if (routeFn) {
    routeFn();
  } else if(["/dashboardAdmin","/dashboardCustomer"].includes(path) && !local ) {
    // Vista de ruta no encontrada
    window.history.replaceState(null, null, "/notfound");
    $ul.innerHTML = `
      <a href="/home" class="btn primary" data-link>Home</a>
      <a href="/login" class="btn primary" data-link>Iniciar sesión</a>
      <a href="/register" class="btn secondary" data-link>Registrarse</a>`;
    $main.innerHTML = `<h1>Not Found</h1>`;
  }
};


