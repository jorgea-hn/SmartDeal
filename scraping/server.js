import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { scrap as createAmazonScraper } from './src_scraping/scripts_scraping/methodsGet.js';
import { scrap as createMLScraper } from './src_scraping/scripts_scraping/methodsApi.js';

const app = express();
const PORT = process.env.PORT || 3001;

// === Middleware ===
app.use(cors());
app.use(bodyParser.json());

// === Asegurar existencia de carpeta y archivo db.json ===
const dbPath = path.resolve('public', 'db.json');

// === Endpoint para obtener productos ===
app.get('/products', (req, res) => {
  const rawData = fs.readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(rawData);
  res.json(db.products || []);
});

// === Endpoints para usuarios ===
// Obtener usuarios
app.get('/users', (req, res) => {
  const rawData = fs.readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(rawData);
  let users = db.users || [];
  const { name, email } = req.query;
  if (name) users = users.filter(u => u.name === name);
  if (email) users = users.filter(u => u.email === email);
  res.json(users);
});

// Registrar un usuario
app.post('/users', (req, res) => {
  const rawData = fs.readFileSync(dbPath, 'utf-8');
  const db = JSON.parse(rawData);
  const newUser = req.body;
  if (!newUser.id) newUser.id = Date.now().toString(16);
  db.users = db.users || [];
  db.users.push(newUser);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  res.status(201).json(newUser);
});

// === Scraping POST ===
app.post('/scrape', async (req, res) => {
  let { query, source } = req.body;

  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

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

    let currentData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    currentData.products = currentData.products.filter(p => !sources.includes(p.source));
    currentData.products.push(...allProducts);
    fs.writeFileSync(dbPath, JSON.stringify(currentData, null, 2), 'utf-8');

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

// === PATCH para historial (agregar filtros) ===
app.patch('/browsingHistory/filter', async (req, res) => {
  const { term, filter } = req.body;

  if (!term || typeof filter !== 'string') {
    return res.status(400).json({ error: 'Missing term or filter' });
  }

  try {
    const rawData = fs.readFileSync(dbPath, 'utf-8');
    const currentData = JSON.parse(rawData);

    if (!Array.isArray(currentData.browsingHistory)) {
      currentData.browsingHistory = [];
    }

    let found = false;
    currentData.browsingHistory = currentData.browsingHistory.map(obj => {
      if (obj.term?.trim().toLowerCase() === term.trim().toLowerCase()) {
        found = true;
        return { ...obj, filter };
      }
      return obj;
    });

    if (!found) {
      currentData.browsingHistory.push({ term: term.trim(), date: new Date().toISOString(), filter });
    }

    fs.writeFileSync(dbPath, JSON.stringify(currentData, null, 2), 'utf-8');

    res.json({ success: true, message: 'Filter updated' });
  } catch (error) {
    console.error('Error updating filter:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ENDPOINTS PARA FILTROS Y HISTORIAL DE USUARIO
// Obtener filtros de usuario
app.get('/userFilters/:userId', (req, res) => {
  const dbPath = path.resolve('public/db.json');
  if (!fs.existsSync(dbPath)) return res.json([]);
  const rawData = fs.readFileSync(dbPath);
  const db = JSON.parse(rawData);
  const userId = req.params.userId;
  res.json(db.userFilters?.[userId] || []);
});

// Guardar filtros de usuario
app.post('/userFilters/:userId', (req, res) => {
  const dbPath = path.resolve('public/db.json');
  if (!fs.existsSync(dbPath)) return res.status(500).json({ error: 'DB not found' });
  const rawData = fs.readFileSync(dbPath);
  const db = JSON.parse(rawData);
  const userId = req.params.userId;
  const filters = req.body.filters;
  db.userFilters = db.userFilters || {};
  db.userFilters[userId] = filters;
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json({ success: true });
});

// Obtener historial de búsquedas de usuario
app.get('/userSearchHistory/:userId', (req, res) => {
  const dbPath = path.resolve('public/db.json');
  if (!fs.existsSync(dbPath)) return res.json([]);
  const rawData = fs.readFileSync(dbPath);
  const db = JSON.parse(rawData);
  const userId = req.params.userId;
  res.json(db.userSearchHistory?.[userId] || []);
});

// Guardar historial de búsquedas de usuario
app.post('/userSearchHistory/:userId', (req, res) => {
  const dbPath = path.resolve('public/db.json');
  if (!fs.existsSync(dbPath)) return res.status(500).json({ error: 'DB not found' });
  const rawData = fs.readFileSync(dbPath);
  const db = JSON.parse(rawData);
  const userId = req.params.userId;
  const entry = req.body; // { term, date, filter }
  db.userSearchHistory = db.userSearchHistory || {};
  db.userSearchHistory[userId] = db.userSearchHistory[userId] || [];
  db.userSearchHistory[userId].push(entry);
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  res.json({ success: true });
});

// === SERVIR FRONTEND (VITE DIST) ===
const viteDistPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(viteDistPath)) {
  app.use(express.static(viteDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/scrape') || req.path.startsWith('/browsingHistory')) return next();
    res.sendFile(path.join(viteDistPath, 'index.html'));
  });
}

// === Iniciar servidor ===
app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});


