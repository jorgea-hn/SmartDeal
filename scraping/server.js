// Importación de módulos necesarios
import express from 'express'; // Framework para crear el servidor
import cors from 'cors'; // Middleware para permitir peticiones entre dominios
import bodyParser from 'body-parser'; // Middleware para leer cuerpos de peticiones JSON
import fs from 'fs'; // Módulo para manipular el sistema de archivos
import path from 'path'; // Módulo para manejar rutas
import axios from 'axios'; // Cliente HTTP para hacer peticiones
import { scrap as createScraper } from './src_scraping/scripts_scraping/methodsGet.js'; // Función de scraping


const app = express();
app.use(cors()); // Habilita CORS
app.use(bodyParser.json()); // Permite que el servidor entienda JSON en el body

const PORT = 3001; // Puerto del servidor backend

//------------------------------------------------------------
// Endpoint POST para hacer scraping y guardar productos + historial
//------------------------------------------------------------
app.post('/scrape', async (req, res) => {
  const { query } = req.body; // Extrae el término de búsqueda

  // Validación básica
  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  try {
    const searchTerm = query.trim(); // Limpia el término
    const scraper = createScraper(searchTerm); // Inicializa el scraper

    const lastPage = await scraper.getLast(); // Obtiene la última página de resultados
    const allProducts = [];
    const maxPages = Math.min(lastPage, 5); // Límite de páginas a scrapear

    // Recorrer cada página y recolectar productos
    for (let page = 1; page <= maxPages; page++) {
      const products = await scraper.getProduct(page);
      allProducts.push(...products);
    }

    // Ruta al archivo JSON (db.json)
    const dbPath = path.resolve('public/db.json');

    // Cargar datos existentes del archivo
    let currentData = { products: [], browsingHistory: [] };
    if (fs.existsSync(dbPath)) {
      const rawData = fs.readFileSync(dbPath);
      currentData = JSON.parse(rawData);
    }

    // Reemplaza los productos anteriores con los nuevos
    currentData.products = allProducts;

    // Escribe el archivo actualizado
    fs.writeFileSync(dbPath, JSON.stringify(currentData, null, 2));

    // ------------------------------------------
    // Guardar el término en el historial si no existe
    // ------------------------------------------
    try {
      const historyRes = await axios.get('http://localhost:3000/browsingHistory'); // Consulta historial en json-server

      // Verifica si el término ya fue buscado (case-insensitive)
      const alreadyExists = historyRes.data.some(entry =>
        entry['term'].trim().toLowerCase() === searchTerm.toLowerCase()
      );

      // Si no está en el historial, lo agrega
      if (!alreadyExists) {
        await axios.post('http://localhost:3000/browsingHistory', {
          term: searchTerm,
          date: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error al consultar/guardar historial:', err.message);
    }

    // Respuesta exitosa al frontend
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

  // Validación
  if (!term || typeof filter !== 'string') {
    return res.status(400).json({ error: 'Missing term or filter' });
  }

  try {
    const dbPath = path.resolve('public/db.json');
    if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: 'Database not found' });
    }

    // Leer datos actuales
    const rawData = fs.readFileSync(dbPath);
    const currentData = JSON.parse(rawData);

    // Asegurar que browsingHistory sea un array
    if (!Array.isArray(currentData.browsingHistory)) {
      currentData.browsingHistory = [];
    }

    // Buscar y actualizar el filtro del término
    let found = false;
    currentData.browsingHistory = currentData.browsingHistory.map(obj => {
      if (obj.term === term) {
        found = true;
        return { ...obj, filter };
      }
      return obj;
    });

    // Si no existe, lo agrega con filtro
    if (!found) {
      currentData.browsingHistory.push({ term, date: new Date().toISOString(), filter });
    }

    // Guardar cambios
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