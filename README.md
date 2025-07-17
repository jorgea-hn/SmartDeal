# SmartDeal

SmartDeal es una plataforma web que permite comparar productos de Amazon y Mercado Libre, aplicando filtros inteligentes y mostrando resultados en tiempo real. Incluye autenticación de usuarios, panel de administración y scraping automatizado.

## Descripción

- Comparador de productos entre Amazon y Mercado Libre.
- Filtros avanzados para excluir palabras clave.
- Scraping automatizado desde backend propio.
- Panel de usuario y panel de administración.
- Interfaz moderna y responsiva con React + TailwindCSS.
- Backend con Express sirviendo el frontend compilado.

## Tecnologías principales

- Frontend: React, Vite, TailwindCSS, Axios, React Router, Headless UI
- Backend: Node.js, Express, Cheerio (scraping), body-parser, cors
- Otros: json-server (mock DB), dotenv

## Estructura del proyecto

```
SmartDeal/
├── scraping/           # Backend Express + Scraping
│   └── server.js
├── src/               # Frontend React
│   ├── components/
│   ├── pages/
│   └── ...
├── public/
│   └── db.json        # Mock DB
├── dist/              # Build frontend (auto-generado)
├── package.json
├── vite.config.js
└── README.md
```

## Instalación y desarrollo local

1. Clona el repositorio:
   ```bash
   git clone <repo-url>
   cd SmartDeal
   ```
2. Instala dependencias:
   ```bash
   npm install
   ```
3. Compila el frontend:
   ```bash
   npm run build
   ```
4. Inicia el backend (sirve el frontend build):
   ```bash
   npm start
   ```
5. Accede a la app en `http://localhost:3001`

## Despliegue en Render

1. Sube tu código a GitHub.
2. En Render, crea un nuevo Web Service desde tu repo.
3. Configura:
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
   - **Root Directory:** (vacío si el package.json está en la raíz)
   - **Rama:** la que desees desplegar (ej: main, master, prueba-back)
4. (Opcional) Agrega variables de entorno en el dashboard de Render.
5. Render instalará dependencias, compilará el frontend y levantará el backend.

## Variables de entorno

- `PORT`: Puerto en el que corre el backend (Render lo asigna automáticamente).
- (Agrega aquí otras variables si tu backend las requiere)

## Autores

- Nikol
- Isai
- David
- Jorge
- Walter
- Marx

---

¡Gracias por usar SmartDeal! Si tienes dudas o sugerencias, abre un issue o contacta a los autores.
