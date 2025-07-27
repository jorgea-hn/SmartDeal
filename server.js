import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

import { scrap as createAmazonScraper } from './src/scripts/methodsGetAmazon.js';
import { scrap as createMercadoScraper } from './src/scripts/methodsGetMercadoLibre.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Ruta al archivo db.json
const DB_PATH = path.resolve('public/db.json');

// Función para leer la base de datos
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    return { products: [], searchingHistory: [] };
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

// Función para guardar la base de datos
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Endpoint de scraping
app.post('/scrape', async (req, res) => {
  const { query, userId, platform } = req.body;

  if (!query || !userId) {
    return res.status(400).json({ error: 'Faltan query y userId' });
  }

  try {
    const searchTerm = query.trim();
    const scraper = platform === 'mercado'
      ? createMercadoScraper(searchTerm)
      : createAmazonScraper(searchTerm);

    const lastPage = await scraper.getLast();
    const maxPages = Math.min(lastPage || 1, 5);
    const allProducts = [];

    for (let page = 1; page <= maxPages; page++) {
      const prods = await scraper.getProduct(page, []);
      prods.forEach(p => {
        p.userId = String(userId);
        p.platform = platform || 'amazon';
      });
      allProducts.push(...prods);
    }

    const db = readDB();

    // Elimina productos del mismo usuario y misma plataforma
    db.products = db.products.filter(p => !(p.userId === String(userId) && p.platform === (platform || 'amazon')));
    db.products.push(...allProducts);

    // Historial de búsqueda
    const exists = db.searchingHistory.some(h =>
      h.userId === String(userId) &&
      h.term.toLowerCase() === searchTerm.toLowerCase() &&
      h.platform === (platform || 'amazon')
    );

    if (!exists) {
      db.searchingHistory.push({
        userId: String(userId),
        term: searchTerm,
        platform: platform || 'amazon',
        filter: [],
        date: new Date().toISOString()
      });
    }

    writeDB(db);

    console.log(`✅ Guardados ${allProducts.length} productos para ${platform}`);
    res.json({ success: true, count: allProducts.length });

  } catch (err) {
    console.error('❌ Error en /scrape:', err);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

// Actualiza filtros de historial
app.patch('/searchingHistory/filter', (req, res) => {
  const { userId, term, filter, platform } = req.body;

  if (!userId || !term || !Array.isArray(filter)) {
    return res.status(400).json({ error: 'Faltan userId, term o filter[]' });
  }

  const db = readDB();
  let found = false;

  db.searchingHistory = db.searchingHistory.map(h => {
    if (
      h.userId === String(userId) &&
      h.term.toLowerCase() === term.toLowerCase() &&
      h.platform === (platform || 'amazon')
    ) {
      found = true;
      return { ...h, filter, date: new Date().toISOString() };
    }
    return h;
  });

  if (!found) {
    db.searchingHistory.push({
      userId: String(userId),
      term,
      platform: platform || 'amazon',
      filter,
      date: new Date().toISOString()
    });
  }

  writeDB(db);
  console.log(`✅ Filtros actualizados para userId=${userId}, term="${term}", platform=${platform}`);
  res.json({ success: true, message: 'Filter updated' });
});

// Obtener productos de un usuario y plataforma
app.get('/products', (req, res) => {
  const { userId, platform } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const db = readDB();
  const products = db.products.filter(p =>
    p.userId === String(userId) && (!platform || p.platform === platform)
  );

  res.json({ products });
});

// Obtener historial completo
app.get('/history', (req, res) => {
  const db = readDB();
  res.json(db.searchingHistory || []);
});

// Escuchar servidor
app.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});
