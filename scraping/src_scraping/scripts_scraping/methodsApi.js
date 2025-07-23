/**
 * Este módulo permite hacer scraping de productos desde Mercado Libre Colombia.
 * Utiliza axios para las peticiones HTTP y cheerio para analizar el HTML.
 */

import axios from "axios";
import * as cheerio from "cheerio";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Accept-Language': 'es-ES,es;q=0.9',
};

/* Función principal para scrapear Mercado Libre */
export const scrap = (searchTerm) => {
  const base = `https://listado.mercadolibre.com.co/${encodeURIComponent(searchTerm)}`;

  return {
    //Obtiene el número de la última página de resultados
    getLast: () => {
      return axios.get(`${base}#D[A:${encodeURIComponent(searchTerm)}]`, { headers }).then(res => {
        const $ = cheerio.load(res.data);
        const pageNumbers = $('.andes-pagination__link')
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
    // Obtiene los productos de una página específica, excluyendo palabras
    getProduct: (page,excludedWords = []) => {
      return axios.get(`${base}${page}`, { headers }).then(res => {
        const $ = cheerio.load(res.data);
        const products = [];

        $('.ui-search-result__wrapper').each((i, el) => {
          const title = $(el).find('.poly-component__title-wrapper').text().trim();
          const currency = $(el).find('.andes-money-amount__currency-symbol').first().text().trim();
          const integer = $(el).find('.andes-money-amount__fraction').first().text().trim();
          const fraction = $(el).find('span.a-price-fraction').first().text().trim();
          const price = currency && integer ? `COP${currency}${integer}${fraction || '.00'
            }` : 'No disponible';
          const link = $(el).find('a').attr('href')?.trim() || ''
          const isExcluded = excludedWords.some(word => title.toLowerCase().includes(word.toLowerCase()));
          if (title && !isExcluded) {
            products.push({ title, price, link});
          }
        });

        console.log(`✅ Página ${page} contiene ${products.length} productos`);
        return products;
      }).catch(err => {
        console.error(`❌ Error al scrapear la página ${page}:`, err.message);
        return [];
      });
    }
  };
};




