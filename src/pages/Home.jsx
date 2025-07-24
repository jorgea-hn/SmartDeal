import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <h1 className="text-2xl font-bold text-indigo-600">SmartDeal</h1>
            </Link>
          </div>
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            >
              <Bars3Icon className="size-6" />
            </button>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link to="/login" className="text-sm font-semibold text-gray-900">
              Iniciar sesión <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>

        {/* Menú móvil */}
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link to="/" className="-m-1.5 p-1.5">
                <h1 className="text-xl font-bold text-indigo-600">SmartDeal</h1>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <XMarkIcon className="size-6" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="py-6">
                  <Link to="/login" className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold text-gray-900 hover:bg-gray-50">
                    Iniciar sesión
                  </Link>
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>

      {/* Hero */}
      <main className="relative isolate px-6 pt-24 lg:px-8">
        <div className="mx-auto max-w-3xl py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
              Compara productos como nunca antes
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              <strong className="text-indigo-600">SmartDeal</strong> te permite explorar y comparar productos de <strong>Amazon</strong> y <strong>MercadoLibre</strong> con filtros inteligentes que eliminan resultados irrelevantes. Ahorra tiempo y encuentra lo que realmente quieres.
            </p>
            <p className="mt-4 text-base text-gray-500 italic">"Di adiós a fundas, cargadores y productos que no buscabas."</p>

            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline-indigo-600"
              >
                Empezar ahora
              </Link>
              <Link to="/login" className="text-sm font-semibold text-gray-900 hover:underline">
                Ya tengo cuenta &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
