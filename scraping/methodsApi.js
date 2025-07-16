import axios from "axios";
import * as cheerio from "cheerio";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
  'Accept-Language': 'es-ES,es;q=0.9',
};

export const scrap = (searchTerm) => {
  const base = `https://www.amazon.com/s?k=${encodeURIComponent(searchTerm)}&language=es&page=`;

  return {
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

    getProduct: (page) => {
      return axios.get(`${base}${page}`, { headers }).then(res => {
        const $ = cheerio.load(res.data);
        const products = [];

        $('div.s-main-slot > div[data-asin]').each((i, el) => {
          const title = $(el).find('h2 span').text().trim();
          const currency = $(el).find('span.a-price-symbol').first().text().trim();
          const integer = $(el).find('span.a-price-whole').first().text().trim();
          const fraction = $(el).find('span.a-price-fraction').first().text().trim();
          const price = currency && integer ? `${currency}${integer}${fraction || '00'
            }` : 'No disponible';

          if (title) {
            products.push({ title, price });
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
