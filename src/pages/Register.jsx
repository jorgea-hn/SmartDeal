import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function verificarExistente(name, email) {
        try {
            const res = await axios.get('http://localhost:3000/users', {
                params: { name, email }
            });
            return res.data.length > 0;
        } catch (error) {
            console.error('Error al verificar usuario existente:', error);
            return false;
        }
    }


    async function manejarRegistro(e) {
        e.preventDefault();

        const yaExiste = await verificarExistente(name, email);
        if (yaExiste) {
            alert('El nombre o el correo ya están registrados');
            return;
        }

        if (!name || !email || !password) {
            alert('Todos los campos son obligatorios');
            return;
        }

        const nuevoUsuario = { name, email, password };

        try {
            const respuesta = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nuevoUsuario),
            });

            if (respuesta.ok) {
                alert('✅ Registro guardado correctamente');
                setName('');
                setEmail('');
                setPassword('');
                navigate("/login");
            } else {
                alert('❌ Error al registrar el usuario');
            }
        } catch (error) {
            console.error(error);
            alert('❌ Error al conectar con la base de datos');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white py-8 px-2">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h1 className="text-3xl font-bold text-center text-indigo-700 mb-8">Crear Cuenta</h1>
                <form onSubmit={manejarRegistro} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                            placeholder="Escribe tu nombre"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition text-lg shadow"
                    >
                        Registrarse
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-500">
                    ¿Ya tienes una cuenta?{' '}
                    <a href="/login" className="text-indigo-600 hover:underline font-semibold">Inicia sesión</a>
                </p>
            </div>
        </div>
    );
}

export default Register;