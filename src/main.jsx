import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './styles/principal.css' 
import { inicializarDatos } from './utils/datos'

try {
  inicializarDatos();
} catch (e) {
  console.error('Inicialización de datos fallida', e);
}

window.addEventListener('beforeunload', () => {
  try {
    localStorage.removeItem('gasexpress_session_token');
    localStorage.removeItem('gasexpress_session_exp');
    localStorage.removeItem('gasexpress_csrf_token');
    localStorage.removeItem('gasexpress_cart');
  } catch {}
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
