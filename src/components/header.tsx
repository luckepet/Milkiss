import { useState } from 'react'
import { TIENDA_CONFIG } from '../config/tienda'

function Header({
  setMostrarCarrito,
  cantidadCarrito,
  busqueda,
  setBusqueda,
  setMenuCategoriasAbierto
}: any) {

  const [mostrarBusqueda, setMostrarBusqueda] = useState(false)

  return (
    <header className="hero">

      <div className="topbar">

        {/* MENÚ */}
        <button
  className="boton-menu"
  onClick={() =>
    setMenuCategoriasAbierto?.(
      (v: boolean) => !v
    )
  }
  aria-label="Abrir menú"
>
  <span></span>
  <span></span>
  <span></span>
</button>


        {/* LOGO CENTRADO */}
        <img
          src="/marca/logo-milkiss.png"
          alt={TIENDA_CONFIG.marca.nombre}
          className="logo-img"
        />


        {/* ICONOS DERECHA */}
        <div className="header-acciones">

          {/* LUPA */}
          <button
            className="boton-buscar"
            onClick={() => setMostrarBusqueda(!mostrarBusqueda)}
            aria-label="Buscar"
          >
            🔍
          </button>


          {/* CARRITO */}
          <button
            className="boton-carrito"
            onClick={() => setMostrarCarrito(true)}
            aria-label="Abrir carrito"
          >
            <span className="icono-carrito">
              🛒
            </span>

            {cantidadCarrito > 0 && (
              <span className="numero-carrito">
                {cantidadCarrito}
              </span>
            )}
          </button>

        </div>

      </div>


      {/* BUSCADOR QUE APARECE AL TOCAR LA LUPA */}
      {mostrarBusqueda && (
        <div className="buscador-desplegable">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            autoFocus
          />
        </div>
      )}

    </header>
  )
}

export default Header