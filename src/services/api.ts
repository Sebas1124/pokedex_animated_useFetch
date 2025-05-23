import axios from 'axios';

// Obtén la URL base de tus variables de entorno (Vite usa import.meta.env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pokeapi.co/api/v2/'; // Ajusta el puerto/ruta


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// (Opcional) Interceptor para manejar errores globalmente o refrescar token
api.interceptors.response.use(
  (response) => response, // Simplemente retorna respuestas exitosas
  (error) => {
    if (error.response?.status === 401) {
       console.error("API Interceptor: Unauthorized (401). Token might be expired or invalid.");
       // Aquí podrías intentar refrescar el token si tuvieras un endpoint para ello
       // O simplemente llamar a logout del AuthContext (más complejo de acceder aquí)
       // Por ahora, solo logueamos. El AuthContext manejará la limpieza al fallar /me
       // Podrías disparar un evento global o usar otra técnica si necesitas logout inmediato
       // window.dispatchEvent(new Event('forceLogout'));
    } else if (error.response?.status === 403) {
        console.error("API Interceptor: Forbidden (403). User lacks permissions.");
    }
    // Rechaza la promesa para que el error pueda ser capturado por el llamador (.catch)
    return Promise.reject(error);
  }
);


export default api;