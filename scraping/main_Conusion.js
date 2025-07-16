import readline from "readline";
import { scrap as createScraper } from "./methodsGet.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("¿Qué producto deseas buscar en Amazon?: ", (query) => {
  rl.question("🔕 ¿Qué palabras deseas excluir del título? (separadas por comas, o presiona Enter si ninguna): ", (exclusions) => {
    const excludedWords = exclusions
      .split(",")
      .map(word => word.trim())
      .filter(word => word.length > 0);

    const scrap = createScraper(query);
    let allProducts = [];

    scrap.getLast().then((lastPage) => {
      if (!lastPage || lastPage <= 0) {
        console.log("❌ No se pudo determinar la última página.");
        rl.close();
        return;
      }

      let chain = Promise.resolve();

      for (let page = 1; page <= lastPage; page++) {
        chain = chain.then(() => {
          return scrap.getProduct(page, excludedWords).then((products) => {
            allProducts.push(...products);
          });
        });
      }

      chain
        .then(() => {
          console.log(`🎯 Total de productos obtenidos: ${ allProducts.length }`);
          console.log(allProducts);
          rl.close();
        })
        .catch((err) => {
          console.error("❌ Error durante el scraping:", err.message);
          rl.close();
        });
    }).catch((err) => {
      console.error("❌ Error al obtener la última página:", err.message);
      rl.close();
    });
  });
});
