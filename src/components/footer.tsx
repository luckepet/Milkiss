import { TIENDA_CONFIG } from '../config/tienda'

function Footer() {
  return (
    <footer className="footer">
      <h3> {TIENDA_CONFIG.marca.nombre}</h3>
      <p>{TIENDA_CONFIG.marca.slogan}</p>
      {TIENDA_CONFIG.contacto.email && <p>📧 {TIENDA_CONFIG.contacto.email}</p>}
      <p>© {new Date().getFullYear()} {TIENDA_CONFIG.marca.nombre} - Todos los derechos reservados.</p>
    </footer>
  )
}

export default Footer
