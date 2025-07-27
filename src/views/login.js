import { api } from "../scripts/methodsApi";
import { showAlert } from "../scripts/sweetAlerts";
import { local_ } from "../scripts/localstorage";

export let renderLogin = (main, ul) => {
  ul.innerHTML = `
    <a href="/home" class="btn primary" data-link>Home</a>
    <a href="/register" class="btn secondary" data-link>Register</a>
  `;
  main.innerHTML = `
    <section class="login-form">
      <h2>Iniciar Sesión</h2>
      <form id="form-login">
        <input type="email" id="email-login" placeholder="Correo electrónico" required />
        <input type="password" id="password-login" placeholder="Contraseña" required />
        <button type="submit">Entrar</button>
      </form>
      <p>¿No tienes una cuenta? <a href="/register" data-link>Regístrate aquí</a></p>
    </section>
  `;

  const $form = document.getElementById('form-login');

  $form.addEventListener('submit', e => {
    e.preventDefault();
    const $email = document.getElementById('email-login').value.trim();
    const $password = document.getElementById('password-login').value.trim();

    api.get('/users').then(data => {
      if (!data) {
        showAlert('You need first sign up in SmartDeal', 'error');
      } else {
        let currentUser = data.filter(i => i.hotmail == $email && i.password == $password);
        if (currentUser.length === 0) {
          showAlert('Error: user or password incorrect', 'error');
        } else {
          localStorage.setItem('user', JSON.stringify(currentUser));
          const userRoute = local_.dashboard(); // /dashboardAdmin o /dashboardCustomer
          if (!userRoute) {
            showAlert('Error: this role does not exist', 'error');
          } else {
            // 👇 Usa pushState o cambia el hash para evitar recarga
            window.history.pushState(null, null, userRoute);
            window.dispatchEvent(new PopStateEvent('popstate')); // ⬅️ Forzar renderizado enrutador
          }
        }
      }
    });
  });
};