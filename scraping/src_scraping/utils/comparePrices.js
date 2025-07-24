// Utilidad para comparar precios entre Amazon y MercadoLibre
// Convierte los precios string a número y normaliza moneda

// Ejemplo de uso:
// const comparados = compareProductPrices([ ...amazonProducts, ...mlProducts ], { usdToCop: 4000 })

function parsePrice(priceStr) {
  // Amazon: "$25.99" o "$25,99" o "$25"
  // ML: "COP$120000.00" o "COP$120.000"
  if (!priceStr || typeof priceStr !== 'string') return null;
  let value = null;
  let currency = 'USD';
  let cleaned = priceStr.replace(/[^\d.,]/g, '');
  if (priceStr.includes('COP')) currency = 'COP';
  // Reemplaza , por . si es decimal
  cleaned = cleaned.replace(/,/g, '.');
  // Elimina puntos de miles si existen
  if (currency === 'COP') cleaned = cleaned.replace(/\.(?=\d{3,})/g, '');
  // Extrae número
  value = parseFloat(cleaned);
  return { value, currency };
}

export function compareProductPrices(products, { usdToCop = 4000 } = {}) {
  // products: [{ title, price, link, source }]
  return products.map(p => {
    const parsed = parsePrice(p.price);
    let priceCop = null;
    if (parsed) {
      if (parsed.currency === 'USD') priceCop = parsed.value * usdToCop;
      else priceCop = parsed.value;
    }
    return {
      ...p,
      priceNum: parsed ? parsed.value : null,
      priceCop,
      currency: parsed ? parsed.currency : null
    };
  });
}

// Puedes ordenar por priceCop para comparar entre sitios
// Ejemplo:
// productos.sort((a, b) => a.priceCop - b.priceCop);
