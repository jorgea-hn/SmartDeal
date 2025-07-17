// Esta función renderiza una lista de productos en un contenedor HTML identificado por su ID.
// Si no se pasa un ID, por defecto usa 'productsContainer'.
export function renderProducts(products, containerId = 'productsContainer') {
  // Se obtiene el contenedor del DOM donde se van a renderizar los productos.
  const container = document.getElementById(containerId);

  // Se limpia el contenido actual del contenedor para evitar duplicados.
  container.innerHTML = '';

  // Si no hay productos o la lista está vacía, se muestra un mensaje informativo y se detiene la función.
  if (!products || products.length === 0) {
    container.innerHTML = '<p>No se encontraron productos.</p>';
    return;
  }

  // Recorre cada producto y crea una tarjeta visual para mostrar su información.
  products.forEach(product => {
    const card = document.createElement('div');

    // Se estiliza la tarjeta con borde, espacio interno y márgenes.
    card.style.border = '1px solid #ccc';
    card.style.padding = '10px';
    card.style.margin = '10px';

    // Se inserta el contenido HTML de la tarjeta: título, precio y un enlace al producto en Amazon.
    card.innerHTML = `
      <h3>${product.title}</h3>
      <p>${product.price || 'Sin precio'}</p>
      <a href="${product.link}" target="_blank">Ver en Amazon</a>
    `;

    // Se añade la tarjeta al contenedor en el DOM.
    container.appendChild(card);
  });
}