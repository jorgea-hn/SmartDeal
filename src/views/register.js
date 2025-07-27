import { api } from "../scripts/methodsApi";
import { showAlert } from "../scripts/sweetAlerts";
import { generalFormat } from "../scripts/validationMethods";
import { local_ } from "../scripts/localstorage";
export let renderRegister = (main, ul) => {
  ul.innerHTML = `
    <a href="/home" class="btn primary" data-link>Home</a>
    <a href="/login" class="btn secondary" data-link>Login</a>
    `;
  main.innerHTML = `
    <section class="register-form">
      <h2>Registro</h2>
      <form id="form-register">
        <input type="text" id="name-register" placeholder="Nombre completo" required />

        <select id="document-type" required>
          <option value="" disabled selected>Tipo de documento</option>
          <option value="CC">Cédula de Ciudadanía (CC)</option>
          <option value="CE">Cédula de Extranjería (CE)</option>
          <option value="PP">Pasaporte (PP)</option>
          <option value="PEP">Permiso Especial de Permanencia (PEP)</option>
          <option value="NIT">Número de Identificación Tributaria (NIT)</option>
        </select>

        <input type="text" id="document-number" placeholder="Número de documento" required />

        <input type="email" id="email-register" placeholder="Correo electrónico" required />
        <input type="password" id="password-register" placeholder="Contraseña" required />
        <input type="password" id="confirm-password" placeholder="Confirmar contraseña" required />

        <button type="submit" id="submit-register">Register</button>
      </form>
      <p>¿Ya tienes una cuenta? <a href="/login" data-link>Inicia sesión</a></p>
    </section>
  `;

  document.getElementById('submit-register').addEventListener('click', (e) => {
    e.preventDefault()
    let $name = document.getElementById('name-register').value.trim();
    let $type = document.getElementById('document-type').value
    let $identification = document.getElementById('document-number').value.trim();
    let $hotmail = document.getElementById('email-register').value.trim();
    let $password = document.getElementById('password-register').value.trim();
    let $confirmPassword = document.getElementById('confirm-password').value.trim();
    try {
      generalFormat.nameFormat($name);
      generalFormat.documenttypeFormat($type)
      generalFormat.identicationFormat($identification);
      generalFormat.hotmailFormat($hotmail);
      generalFormat.passwordFormat($password, $confirmPassword)
      api.get('/users')
        .then(data => {
          const even = propertyValue => propertyValue.hotmail === $hotmail
          if (data.some(even)) throw new Error("Error this hotmail already exists");
          let user = {
            name: $name,
            documentType: $type,
            identification: $identification,
            hotmail: $hotmail,
            password: $password,
            role: "customer"
          }

          api.post('/users', user)
          localStorage.setItem('user',JSON.stringify(user));
          let user_ = local_.dashboard
          user_()


        })
        .catch(error => {
          showAlert(error.message,'error')
          throw error
        })


    }
    catch (error) {
      showAlert(error.message,'error')
    }
  })
}
