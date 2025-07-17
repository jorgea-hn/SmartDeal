// Importamos axios para hacer solicitudes HTTP y cheerio para analizar el HTML
import axios from "axios";
import * as cheerio from "cheerio";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Accept-Language': 'es-ES,es;q=0.9',
};

// Exportamos una función scrap que recibe un término de búsqueda 
export const scrap = (searchTerm) => {
  // Construimos la URL base para Amazon
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&language=es&page=`;

 
  return {
    // Método para obtener el número de la última página disponible de resultados
    getLast: () => {
      return axios.get(`${base}1`, { headers }).then(res => {
        const $ = cheerio.load(res.data); 
        const pageNumbers = $('span.s-pagination-item, a.s-pagination-item') 
          .map((i, el) => $(el).text().trim()) 
          .get()
          .filter(txt => /^\d+$/.test(txt)) 
          .map(Number); 

        return Math.max(...pageNumbers); 
      }).catch(err => {
        console.error("❌ Error al obtener la última página:", err.message);
        return 0;
      });
    },

    // Método para obtener los productos de una página específica
    getProduct: (page, excludedWords = []) => {
      return axios.get(`${base}${page}`, { headers }).then(res => {
        const $ = cheerio.load(res.data); 
        const products = []; 

        // Iteramos sobre los divs que contienen productos 
        $('div.s-main-slot > div[data-asin]').each((i, el) => {
          const title = $(el).find('h2 span').text().trim(); 
          const currency = $(el).find('span.a-price-symbol').first().text().trim(); 
          const integer = $(el).find('span.a-price-whole').first().text().trim(); 
          const fraction = $(el).find('span.a-price-fraction').first().text().trim(); 
          const price = currency && integer ? `${currency}${integer}${fraction || '00'}` : 'No disponible';

          // Obtenemos el link al producto
          let link = $(el).find('a.a-link-normal').attr('href');
          link = `https://www.amazon.com${link}`

       
          const lowerTitle = title.toLowerCase();
          const contieneProhibidas = excludedWords.some(word => lowerTitle.includes(word.toLowerCase()));

         
          if (title && !contieneProhibidas) {
            products.push({
              title, price, link, source: "amazon"
            });
          }
        });

        console.log(`✅ Página ${page} contiene ${products.length} productos válidos`);
        return products; 
      }).catch(err => {
        console.error(`❌ Error al scrapear la página ${page}:`, err.message);
        return []; 
      });
    }
  };
};
