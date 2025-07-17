// Importamos axios para hacer solicitudes HTTP y cheerio para analizar el HTML
import axios from "axios";
import * as cheerio from "cheerio";

// Definimos headers personalizados para simular un navegador real al hacer scraping
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Accept-Language': 'es-ES,es;q=0.9',
};

// Exportamos una función scrap que recibe un término de búsqueda (searchTerm)
export const scrap = (searchTerm) => {
  // Construimos la URL base para Amazon en español, codificando el término
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&language=es&page=`;

  // Retornamos un objeto con dos métodos: getLast y getProduct
  return {
    // Método para obtener el número de la última página disponible de resultados
    getLast: () => {
      return axios.get(`${base}1`, { headers }).then(res => {
        const $ = cheerio.load(res.data); // Cargamos el HTML con cheerio
        const pageNumbers = $('span.s-pagination-item, a.s-pagination-item') // Seleccionamos los elementos de paginación
          .map((i, el) => $(el).text().trim()) // Extraemos el texto (números de página)
          .get()
          .filter(txt => /^\d+$/.test(txt)) // Filtramos solo los que sean números
          .map(Number); // Convertimos a enteros

        return Math.max(...pageNumbers); // Devolvemos el mayor (última página)
      }).catch(err => {
        console.error("❌ Error al obtener la última página:", err.message);
        return 0; // Si hay error, devolvemos 0
      });
    },

    // Método para obtener los productos de una página específica
    getProduct: (page, excludedWords = []) => {
      return axios.get(`${base}${page}`, { headers }).then(res => {
        const $ = cheerio.load(res.data); // Cargamos el HTML
        const products = []; // Inicializamos el array de productos

        // Iteramos sobre los divs que contienen productos (data-asin evita elementos irrelevantes)
        $('div.s-main-slot > div[data-asin]').each((i, el) => {
          const title = $(el).find('h2 span').text().trim(); // Obtenemos el título
          const currency = $(el).find('span.a-price-symbol').first().text().trim(); // Moneda
          const integer = $(el).find('span.a-price-whole').first().text().trim(); // Parte entera del precio
          const fraction = $(el).find('span.a-price-fraction').first().text().trim(); // Parte decimal
          const price = currency && integer ? `${currency}${integer}${fraction || '00'}` : 'No disponible'; // Construimos el precio

          // Obtenemos el link al producto
          let link = $(el).find('a.a-link-normal').attr('href');
          link = `https://www.amazon.com${link}`

          // Verificamos si el título contiene alguna palabra prohibida (en minúsculas)
          const lowerTitle = title.toLowerCase();
          const contieneProhibidas = excludedWords.some(word => lowerTitle.includes(word.toLowerCase()));

          // Si el título es válido y no contiene palabras excluidas, lo agregamos al array
          if (title && !contieneProhibidas) {
            products.push({
              title, price, link
            });
          }
        });

        console.log(`✅ Página ${page} contiene ${products.length} productos válidos`);
        return products; // Retornamos el array de productos
      }).catch(err => {
        console.error(`❌ Error al scrapear la página ${page}:`, err.message);
        return []; // Si hay error, retornamos array vacío
      });
    }
  };
};
