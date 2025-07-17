// src/pages/Products.jsx
import { useEffect, useState } from "react";

export function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/products") // Asegúrate de que esto sea correcto
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar productos:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando productos...</p>;

  return (
    <section className="p-6">
      <h2 className="text-2xl font-bold mb-4">Productos Extraídos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product, index) => (
          <div key={index} className="bg-white shadow rounded p-4">
            <h3 className="font-semibold text-lg mb-2">{product.title}</h3>
            <p className="text-sm text-gray-700">{product.price}</p>
            {product.image && (
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-40 object-contain mt-2"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
