import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Register() {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [clave, setClave] = useState('');
    const navegate = useNavigate();

    async function verificarExistente(nombre, email) {
        try {
            const res = await axios.get('http://localhost:3000/users', {
                params: { nombre, email }
            });
            return res.data.length > 0;
        } catch (error) {
            console.error('Error al verificar usuario existente:', error);
            return false;
        }
    }


    async function manejarRegistro(e) {
        e.preventDefault();

        const yaExiste = await verificarExistente (nombre, email);
        if (yaExiste) {
            alert('El nombre o el correo ya estan registrado');
            return
        } 

        if (!nombre || !email || !clave) {
            alert(' Todos los campos son obligatorios');
            return;
        }

        const nuevoUsuario = { nombre, email, clave };

        try {
            const respuesta = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoUsuario),
            }); axios

            if (respuesta.ok) {
                alert('✅ Registro guardado correctamente');
                setNombre('');
                setEmail('');
                setClave('');
                navegate("/login")
                
            } else {
                alert('❌ Error al registrar el usuario');
            }
        } catch (error) {
            console.error(error);
            alert('❌ Error al conectar con la base de datos');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
            <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md border border-gray-200">
                <h1 className="text-2xl font-bold text-center text-gray-700 mb-6">Crear Cuenta</h1>

                <form onSubmit={manejarRegistro} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600">Nombre</label>
                        <input
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Escribe tu nombre"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-600">Contraseña</label>
                        <input
                            type="password"
                            value={clave}
                            onChange={(e) => setClave(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                    >
                        Registrarse
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Register;