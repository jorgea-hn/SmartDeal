import readline from "readline";
import { scrap as createScraper } from "./methodsGet.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("¿Qué producto deseas buscar en Amazon?: ", async (query) => {
  const scrap = createScraper(query);
  let allProducts = [];

  const lastPage = await scrap.getLast();
  if (!lastPage || lastPage <= 0) {
    console.log("❌ No se pudo determinar la última página.");
    rl.close();
    return;
  }

  for (let page = 1; page <= lastPage; page++) {
    const products = await scrap.getProduct(page);
    allProducts.push(...products);
  }

  console.log(`🎯 Total de productos obtenidos: ${allProducts.length}`);
  console.log(allProducts);

  rl.close();
});
