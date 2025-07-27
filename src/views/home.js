export let renderHome = (main, ul) => {
  ul.innerHTML = `
    <a href="/login" class="btn primary" data-link>Iniciar sesión</a>
    <a href="/register" class="btn secondary" id="btn-secon" data-link>Registrarse</a>
  `;

  main.innerHTML = `
    <section class="home-container">
      <div class="hero">
        <h1>Bienvenido a <span class="highlight">SmartDeal</span></h1>
        <p class="subtitle">
          Descubre una nueva forma de comprar: racional, comparativa y sin consumismo impulsivo.
        </p>
        <p class="quote">“Comprar con conciencia es invertir en lo que realmente importa.”</p>
        <div class="cta-buttons">
          <a href="/register" class="btn primary" data-link>Únete ahora</a>
          <a href="/login" class="btn secondary" data-link>Ya tengo cuenta</a>
        </div>
      </div>
    </section>
  `;
};

