import { TIENDA_CONFIG } from '../config/tienda'

function Header({ 
  setMostrarCarrito,
  cantidadCarrito,
  busqueda,
  setBusqueda
}: any) {
  return (
    <header className="hero">

      <div className="topbar">

        <img
         src="/marca/logo-milkiss.png"
          alt={TIENDA_CONFIG.marca.nombre}
          className="logo-img"
        />

        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <button
          className="boton-carrito"
          onClick={() => setMostrarCarrito(true)}
        >
          <span style={{ fontSize: "28px" }}>
            🛒
          </span>

          <span className="numero-carrito">
            {cantidadCarrito}
          </span>
        </button>

      </div>

    </header>
  )
}

export default Header