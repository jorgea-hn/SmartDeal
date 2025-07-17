// Importación de módulos necesarios

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { scrap as createAmazonScraper } from './src_scraping/scripts_scraping/methodsGet.js';
import { scrap as createMLScraper } from './src_scraping/scripts_scraping/methodsApi.js';



const app = express();
app.use(cors());
app.use(bodyParser.json());


// === SERVIR FRONTEND (VITE BUILD) ===
const viteDistPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(viteDistPath)) {
  app.use(express.static(viteDistPath));
  // Catch-all: para rutas de React Router
  app.get('*', (req, res, next) => {
    // Si la ruta empieza con /api o /scrape, sigue a la siguiente ruta
    if (req.path.startsWith('/scrape') || req.path.startsWith('/browsingHistory')) return next();
    res.sendFile(path.join(viteDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001; // Usar variable de entorno para Render


//------------------------------------------------------------
// Endpoint POST para hacer scraping y guardar productos + historial
//------------------------------------------------------------
app.post('/scrape', async (req, res) => {
  let { query, source } = req.body;

  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  // Permitir array de fuentes o string
 let sources = [];
if (Array.isArray(source)) {
  sources = source.map(s => s.toLowerCase());
} else if (typeof source === 'string') {
  sources = [source.toLowerCase()];
} else {
  sources = ['amazon', 'mercadolibre'];
}

  const validSources = ['amazon', 'mercadolibre'];
  sources = sources.filter(s => validSources.includes(s));
  if (sources.length === 0) {
    return res.status(400).json({ error: 'Invalid source. Use amazon or mercadolibre.' });
  }

  try {
    const searchTerm = query.trim();
    const allProducts = [];

    for (const selectedSource of sources) {
      const scraper = selectedSource === 'mercadolibre'
        ? createMLScraper(searchTerm)
        : createAmazonScraper(searchTerm);

      const lastPage = await scraper.getLast();
      const maxPages = Math.min(lastPage, 5);

      for (let page = 1; page <= maxPages; page++) {
        const products = await scraper.getProduct(page);
        allProducts.push(...products.map(p => ({ ...p, source: selectedSource })));
      }
    }

    // Ruta al archivo JSON (db.json)
    const dbPath = path.resolve('public/db.json');

    // Cargar datos existentes del archivo
    let currentData = { products: [], browsingHistory: [] };
    if (fs.existsSync(dbPath)) {
      const rawData = fs.readFileSync(dbPath);
      currentData = JSON.parse(rawData);
    }

    // Elimina los productos anteriores de las fuentes seleccionadas
    currentData.products = currentData.products.filter(
      p => !sources.includes(p.source)
    );
    // Agrega los nuevos productos de todas las fuentes
    currentData.products = [...currentData.products, ...allProducts];

    // Escribe el archivo actualizado
    fs.writeFileSync(dbPath, JSON.stringify(currentData, null, 2));

    // Guardar el término en el historial si no existe
    try {
      const historyRes = await axios.get('http://localhost:3000/browsingHistory');
      const alreadyExists = historyRes.data.some(entry =>
        entry['term'].trim().toLowerCase() === searchTerm.toLowerCase()
      );
      if (!alreadyExists) {
        await axios.post('http://localhost:3000/browsingHistory', {
          term: searchTerm,
          date: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error al consultar/guardar historial:', err.message);
    }

    res.json({ success: true, count: allProducts.length });
  } catch (error) {
    console.error('Error en /scrape:', error);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

//------------------------------------------------------------
// PATCH: Actualizar el filtro de un término en el historial
//------------------------------------------------------------
app.patch('/browsingHistory/filter', async (req, res) => {
  const { term, filter } = req.body;

  if (!term || typeof filter !== 'string') {
    return res.status(400).json({ error: 'Missing term or filter' });
  }

  try {
    const dbPath = path.resolve('public/db.json');
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database not found' });
    }

    const rawData = fs.readFileSync(dbPath);
    const currentData = JSON.parse(rawData);

    if (!Array.isArray(currentData.browsingHistory)) {
      currentData.browsingHistory = [];
    }

    let found = false;
    currentData.browsingHistory = currentData.browsingHistory.map(obj => {
      if (obj.term === term) {
        found = true;
        return { ...obj, filter };
      }
      return obj;
    });

    if (!found) {
      currentData.browsingHistory.push({ term, date: new Date().toISOString(), filter });
    }

    fs.writeFileSync(dbPath, JSON.stringify(currentData, null, 2));

    res.json({ success: true, message: 'Filter updated' });
  } catch (error) {
    console.error('Error updating filter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//------------------------------------------------------------
// Inicializar servidor
//------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Backend corriendo en http://localhost:${PORT}`);
});