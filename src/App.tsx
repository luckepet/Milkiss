import './App.css'
import { TIENDA_CONFIG } from './config/tienda'

import Footer from './components/footer'

import { useEffect, useState } from 'react'
import type { TouchEvent, FormEvent } from 'react'

import { supabase } from './lib/supabase'

type Categoria = {
  id: number
  nombre: string
  parent_id: number | null
  orden: number
  activa: boolean
}

type Producto = {
  id: number
  name: string
  orden: number
  description: string | null
  price: number
  descuento_porcentaje?: number
  image: string | null
  category: string[] | string | null
  stock: number
  stock_reservado: number
  tiene_talle: boolean
  talles: string[]
}

type Variante = {
  id: number
  producto_id: number
  talle: string
  color: string
  precio: number
}

type Imagen = {
  producto_id?: number
  variante_id?: number
  image_url: string
  orden: number
}

type ItemCarrito = Producto & {
  cantidad: number
  talle: string | null
  color: string | null
  variante_id: number | null
  price: number
  image: string | null
}

// =====================================================
// CONFIGURACIÓN DE LA TIENDA
// =====================================================

const WHATSAPP_NUMERO = TIENDA_CONFIG.contacto.whatsappNumero
const MONEDA = TIENDA_CONFIG.tienda.moneda
const COLOR_MENU_PRINCIPAL = '#ba92bb'
const COLOR_MENU_OSCURO = '#9b729c'
const COLOR_MENU_MEDIO = '#aa82ad'
const COLOR_MENU_CLARO = '#c8a8c9'
const COLOR_MENU_ALTERNATIVO = '#b387b4'
const COLOR_MENU_SECUNDARIO = '#a67ea7'
const COLOR_MENU_BOTON = '#ba92bb'
const COLOR_MENU_BOTON_HOVER = '#a87fa9'
const DESCUENTO_TRANSFERENCIA = 15


const TEXTOS = {
  carritoVacio: 'Tu carrito está vacío.', completarCampos: 'Completá todos los campos.',
  errorStock: 'No hay stock suficiente para uno de los productos. Revisá tu carrito e intentá nuevamente.',
  errorPedido: 'No pudimos registrar el pedido. Intentá nuevamente.', todosLosProductos: 'Todos los productos',
  sinCategorias: 'No hay categorías disponibles.', checkout: 'Finalizar compra', datosEntrega: 'Datos de entrega',
  checkoutSubtitulo: 'Completá tus datos para enviar el pedido.', resumenPedido: 'Resumen del pedido',
  enviandoPedido: 'Enviando pedido...', enviarPedido: 'Enviar pedido', continuarWhatsApp: 'Continuar por WhatsApp',
  seguirComprando: 'Seguir comprando', sinStock: 'SIN STOCK', sinImagen: 'Sin imagen',
  alertaSinStock: 'Este producto no tiene stock disponible.', seleccionarTalle: 'Seleccioná un talle.',
  seleccionarColor: 'Seleccioná un color.', agregarCarrito: 'Agregar al carrito', sinProductosDescripcion: 'Probá buscando otro producto.'
} as const

const GRADIENTE_MENU_PRINCIPAL = `linear-gradient(135deg, ${COLOR_MENU_PRINCIPAL} 0%, ${COLOR_MENU_OSCURO} 100%)`
const GRADIENTE_MENU_ALTERNATIVO = `linear-gradient(135deg, ${COLOR_MENU_ALTERNATIVO} 0%, ${COLOR_MENU_SECUNDARIO} 100%)`
const GRADIENTE_MENU_BOTON = `linear-gradient(135deg, ${COLOR_MENU_BOTON} 0%, ${COLOR_MENU_BOTON_HOVER} 100%)`

const aplicarColoresTienda = () => {
  const colores = TIENDA_CONFIG.colores
  const root = document.documentElement

  const variables: Record<string, string> = {
    '--color-principal': colores.principal,
    '--color-secundario': colores.secundario,
    '--color-secundario-claro': colores.secundarioClaro,
    '--color-fondo': colores.fondo,
    '--color-texto': colores.texto,
    '--color-texto-claro': colores.textoClaro,

    '--color-menu-principal': COLOR_MENU_PRINCIPAL,
    '--color-menu-oscuro': COLOR_MENU_OSCURO,
    '--color-menu-medio': COLOR_MENU_MEDIO,
    '--color-menu-claro': COLOR_MENU_CLARO,
    '--color-menu-alternativo': COLOR_MENU_ALTERNATIVO,
    '--color-menu-secundario': COLOR_MENU_SECUNDARIO,
    '--color-menu-boton': COLOR_MENU_BOTON,
    '--color-menu-boton-hover': COLOR_MENU_BOTON_HOVER,

    '--color-blanco': '#ffffff',
    '--color-negro': '#000000',
    '--color-texto-oscuro': '#222222',
    '--color-texto-medio': '#555555',
    '--color-texto-suave': '#777777',
    '--color-placeholder': '#999999',
    '--color-borde': '#dddddd',
    '--color-borde-claro': '#eeeeee',
    '--color-fondo-suave': '#f8f8f8',
    '--color-fondo-imagen': '#f5f5f5',
    '--color-hover': '#f0e5f1',
    '--color-error': '#c62828',
    '--color-negro-suave': '#333333',

    '--color-menu-oscuro-transparente-10': 'rgba(155,114,156,.10)',
    '--color-menu-oscuro-transparente-12': 'rgba(155,114,156,.12)',
    '--color-menu-oscuro-transparente-20': 'rgba(155,114,156,.20)',
    '--color-menu-oscuro-transparente-25': 'rgba(155,114,156,.25)',
    '--color-menu-oscuro-transparente-86': 'rgba(155,114,156,.86)',
    '--color-fondo-transparente-94': 'rgba(255,255,255,.94)',
  }

  Object.entries(variables).forEach(([nombre, valor]) => {
    root.style.setProperty(nombre, valor)
  })
}


// =====================================================
// ESTADÍSTICAS
// =====================================================

const obtenerSessionId = () => {
  const clave = TIENDA_CONFIG.estadisticas.sessionStorageKey

  let sessionId = localStorage.getItem(clave)

  if (!sessionId) {
    sessionId = crypto.randomUUID()

    localStorage.setItem(
      clave,
      sessionId
    )
  }

  return sessionId
}

const obtenerDispositivo = () => {
  return window.innerWidth <= 768
    ? 'Celular'
    : 'PC'
}

const registrarEvento = async (
  evento: string,
  producto?: Producto | null
) => {
  try {
    const sessionId = obtenerSessionId()
    const dispositivo = obtenerDispositivo()

    const { error } = await supabase
      .from('Visitas')
      .insert({
        session_id: sessionId,
        evento,
        producto_id: producto?.id || null,
        producto_nombre: producto?.name || null,
        dispositivo,
        fecha: new Date().toISOString()
      })

    if (error) {
      console.error(
        'ERROR REGISTRANDO ESTADÍSTICA:',
        error
      )
    }
  } catch (error) {
    console.error(
      'ERROR ESTADÍSTICAS:',
      error
    )
  }
}

function Header({
  setMostrarCarrito,
  cantidadCarrito,
  busqueda,
  setBusqueda,
  menuCategoriasAbierto,
  setMenuCategoriasAbierto,
}: {
  setMostrarCarrito: (valor: boolean) => void
  cantidadCarrito: number
  busqueda: string
  setBusqueda: (valor: string) => void
  menuCategoriasAbierto: boolean
  setMenuCategoriasAbierto: (valor: boolean) => void
}) {
  const [mostrarBuscador, setMostrarBuscador] = useState(false)

  return (
    <header className="hero">
      <div className="topbar">
        <button type="button" className="boton-menu" aria-label="Abrir categorías" aria-expanded={menuCategoriasAbierto} onClick={() => setMenuCategoriasAbierto(!menuCategoriasAbierto)}>
          <span></span><span></span><span></span>
        </button>
        <img src={TIENDA_CONFIG.marca.logo} alt={TIENDA_CONFIG.marca.nombre} className="logo-img" />
        <div className="header-acciones">
          <button type="button" className="boton-buscar" aria-label="Buscar" onClick={() => setMostrarBuscador(v => !v)}>
            <span className="icono-lupa" aria-hidden="true"></span>
          </button>
          <button type="button" className="boton-carrito" aria-label="Abrir carrito" onClick={() => setMostrarCarrito(true)}>
            <span className="icono-carrito" aria-hidden="true">🛒</span>
            {cantidadCarrito > 0 && <span className="numero-carrito">{cantidadCarrito}</span>}
          </button>
        </div>
      </div>
      {mostrarBuscador && (
        <div className="buscador-desplegable">
          <div className="buscador-caja">
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar productos..." />
          </div>
        </div>
      )}
    </header>
  )
}

function App() {
  const [productos, setProductos] =
    useState<Producto[]>([])

 const [cargandoProductos, setCargandoProductos] = useState(true)

  const [categorias, setCategorias] =
    useState<Categoria[]>([])

  const [menuCategoriasAbierto, setMenuCategoriasAbierto] =
    useState(false)

  const [categoriasExpandida, setCategoriasExpandida] =
    useState<Set<number>>(new Set())

  const [imagenesPortada, setImagenesPortada] =
    useState<Record<number, string>>({})

  const [carrito, setCarrito] =
    useState<ItemCarrito[]>([])

  const [mostrarCarrito, setMostrarCarrito] =
    useState(false)

  const [busqueda, setBusqueda] =
    useState('')

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState('Todos')

  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null)

  const [talleSeleccionado, setTalleSeleccionado] =
    useState('')

  const [colorSeleccionado, setColorSeleccionado] =
    useState('')

  const [cantidadProducto, setCantidadProducto] =
    useState(1)

  const [variantes, setVariantes] =
    useState<Variante[]>([])

  const [imagenesProducto, setImagenesProducto] =
    useState<string[]>([])

  const [imagenesVariantes, setImagenesVariantes] =
    useState<Record<number, string[]>>({})

const [, setImagenesGenerales] =
  useState<string[]>([])
  const [fotoActual, setFotoActual] =
    useState(0)

  const [cargandoDetalle, setCargandoDetalle] =
    useState(false)

  const [imagenAmpliada, setImagenAmpliada] =
    useState(false)

  const [inicioToque, setInicioToque] =
    useState<number | null>(null)

  // =====================================================
  // CHECKOUT
  // =====================================================

  const [mostrarCheckout, setMostrarCheckout] =
    useState(false)

  const [enviandoPedido, setEnviandoPedido] =
    useState(false)

  const [pedidoCreado, setPedidoCreado] =
    useState(false)

  const [urlWhatsAppPedido, setUrlWhatsAppPedido] =
    useState('')

  const [emailEnviado, setEmailEnviado] =
    useState(false)

  const [errorPedido, setErrorPedido] =
    useState('')

  const [datosCliente, setDatosCliente] =
    useState({
      nombre: '',
      apellido: '',
      direccion: '',
      codigo_postal: '',
      telefono: '',
      email: ''
    })

  // =====================================================
  // RECUPERACIÓN DE CONTRASEÑA
  // =====================================================

const [modoRecuperacion, setModoRecuperacion] =
  useState(() => {
    const hash = window.location.hash

    return (
      hash.includes('type=recovery') ||
      hash.includes('access_token=')
    )
  })

  const [nuevaContrasena, setNuevaContrasena] =
    useState('')

  const [repetirContrasena, setRepetirContrasena] =
    useState('')

  const [errorRecuperacion, setErrorRecuperacion] =
    useState('')

  const [mensajeRecuperacion, setMensajeRecuperacion] =
    useState('')

  const [guardandoContrasena, setGuardandoContrasena] =
    useState(false)

  // =====================================================
  // REGISTRAR VISITA
  // =====================================================

  useEffect(() => {
    registrarEvento('visita')
  }, [])
  
  // =====================================================
  // DETECTAR RECUPERACIÓN DE CONTRASEÑA
  // =====================================================

useEffect(() => {
  let recuperacionDetectada = false

  const activarRecuperacion = () => {
    if (recuperacionDetectada) return

    recuperacionDetectada = true
    setModoRecuperacion(true)
    setErrorRecuperacion('')
    setMensajeRecuperacion('')
  }

  // Detecta inmediatamente si Supabase ya inició una sesión
  // de recuperación al abrir el enlace del correo.
  supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      const hash = window.location.hash

      if (
        hash.includes('access_token=') ||
        hash.includes('type=recovery')
      ) {
        activarRecuperacion()
      }
    }
  })

  // También escucha el evento específico de recuperación.
  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      activarRecuperacion()
    }
  })

  return () => {
    subscription.unsubscribe()
  }
}, [])

  const cambiarContrasena = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setErrorRecuperacion('')
    setMensajeRecuperacion('')

    if (!nuevaContrasena || !repetirContrasena) {
      setErrorRecuperacion('Completá los dos campos.')
      return
    }

    if (nuevaContrasena !== repetirContrasena) {
      setErrorRecuperacion('Las contraseñas no coinciden.')
      return
    }

    if (nuevaContrasena.length < 6) {
      setErrorRecuperacion('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setGuardandoContrasena(true)

    const { error } = await supabase.auth.updateUser({
      password: nuevaContrasena
    })

    setGuardandoContrasena(false)

    if (error) {
      console.error('ERROR CAMBIANDO CONTRASEÑA:', error)
      setErrorRecuperacion(
        error.message || 'No pudimos cambiar la contraseña.'
      )
      return
    }

    setMensajeRecuperacion('Contraseña cambiada correctamente.')
    setNuevaContrasena('')
    setRepetirContrasena('')

    window.setTimeout(() => {
      setModoRecuperacion(false)
    }, 1500)
  }


  // =====================================================
  // NORMALIZAR URL
  // =====================================================

  const normalizarUrl = (valor: string) => {
    if (!valor) return ''

    try {
      const url = new URL(valor)

      return decodeURIComponent(
        url.pathname
      )
        .replace(
          '/storage/v1/object/public/',
          ''
        )
        .replace(
          '/storage/v1/object/sign/',
          ''
        )
        .replace(
          '/storage/v1/object/authenticated/',
          ''
        )
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .toLowerCase()
    } catch {
      return valor
        .split('?')[0]
        .split('#')[0]
        .trim()
        .replace(/^\/+/, '')
        .replace(/\/+$/, '')
        .toLowerCase()
    }
  }

  // =====================================================
  // FOTOS ÚNICAS
  // =====================================================

  const fotosUnicas = (fotos: string[]) => {
    const resultado: string[] = []
    const utilizadas = new Set<string>()

    fotos.forEach(foto => {
      if (!foto) return

      const limpia = foto.trim()

      if (!limpia) return

      const clave = normalizarUrl(limpia)

      if (!utilizadas.has(clave)) {
        utilizadas.add(clave)
        resultado.push(limpia)
      }
    })

    return resultado
  }

  // =====================================================
  // STOCK DISPONIBLE
  // =====================================================

  const stockDisponible = (
    producto: Producto
  ) => {
    return Math.max(
      0,
      Number(producto.stock || 0) -
        Number(
          producto.stock_reservado || 0
        )
    )
  }

  // =====================================================
  // CARGA INICIAL
  // =====================================================

  useEffect(() => {
    cargarProductos()
    cargarCategorias()
  }, [])

  // =====================================================
  // COLORES GLOBALES DE LA TIENDA
  // =====================================================

  useEffect(() => {
    aplicarColoresTienda()
  }, [])

  // =====================================================
  // CARGAR FOTOS DE PORTADA
  // =====================================================

  useEffect(() => {
    if (productos.length > 0) {
      cargarFotosPortada()
    }
  }, [productos])

  // =====================================================
  // HISTORIAL DEL NAVEGADOR
  // =====================================================

  useEffect(() => {
    if (
      !window.history.state?.tiendaBase
    ) {
      window.history.replaceState(
        {
          tiendaBase: true
        },
        '',
        window.location.href
      )
    }

    const manejarAtras = () => {
      if (productoSeleccionado) {
        cerrarProductoSinHistorial()
      }
    }

    window.addEventListener(
      'popstate',
      manejarAtras
    )

    return () => {
      window.removeEventListener(
        'popstate',
        manejarAtras
      )
    }
  }, [productoSeleccionado])

  // =====================================================
  // LIMPIAR PRODUCTO
  // =====================================================

  const limpiarProductoSeleccionado = () => {
    setProductoSeleccionado(null)
    setCantidadProducto(1)
    setTalleSeleccionado('')
    setColorSeleccionado('')
    setVariantes([])
    setImagenesVariantes({})
    setImagenesProducto([])
    setImagenesGenerales([])
    setFotoActual(0)
    setImagenAmpliada(false)
    setCargandoDetalle(false)
  }

  const cerrarProductoSinHistorial = () => {
    limpiarProductoSeleccionado()
  }

  // =====================================================
  // PRODUCTOS
  // =====================================================

async function cargarProductos() {
    setCargandoProductos(true)
    try {
  const {
    data,
    error
  } = await supabase
    .from('Productos')
    .select('*')
    .order('orden', {
      ascending: true,
      nullsFirst: false
    })
    .order('id', {
      ascending: false
    })

  if (error) {
    console.error(
      'ERROR PRODUCTOS:',
      error
    )
    return
  }

  setProductos(
    (data || []) as Producto[]
  )
    } finally {
      setCargandoProductos(false)
    }
  }

  // =====================================================
  // SECCIONES
  // =====================================================

  async function cargarCategorias() {
    const { data, error } = await supabase.from('Categorias').select('id, nombre, parent_id, orden, activa').eq('activa', true).order('orden', { ascending: true }).order('id', { ascending: true })
    if (error) { console.warn('CATEGORIAS JERÁRQUICAS NO DISPONIBLES:', error); setCategorias([]); return }
    setCategorias((data || []) as Categoria[])
  }

  // =====================================================
  // FOTOS DE PORTADA
  // =====================================================

  async function cargarFotosPortada() {
    const mapa: Record<
      number,
      string
    > = {}

    const {
      data,
      error
    } = await supabase
      .from('ProductoImagenes')
      .select(
        'producto_id, image_url, orden'
      )
      .order('orden', {
        ascending: true
      })

    if (error) {
      console.error(
        'ERROR FOTOS PORTADA:',
        error
      )
    } else {
      ;(data || []).forEach(
        (imagen: Imagen) => {
          if (
            imagen.producto_id &&
            imagen.image_url?.trim() &&
            !mapa[
              imagen.producto_id
            ]
          ) {
            mapa[
              imagen.producto_id
            ] =
              imagen.image_url.trim()
          }
        }
      )
    }

    productos.forEach(
      producto => {
        if (
          !mapa[producto.id] &&
          producto.image?.trim()
        ) {
          mapa[producto.id] =
            producto.image.trim()
        }
      }
    )

    setImagenesPortada(mapa)
  }

  // =====================================================
  // CARGAR FOTOS GENERALES
  // =====================================================

  async function cargarImagenesGenerales(
    producto: Producto
  ) {
    let fotos: string[] = []

    if (producto.image?.trim()) {
      fotos.push(
        producto.image.trim()
      )
    }

    const {
      data,
      error
    } = await supabase
      .from('ProductoImagenes')
      .select(
        'image_url, orden'
      )
      .eq(
        'producto_id',
        producto.id
      )
      .order('orden', {
        ascending: true
      })

    if (error) {
      console.error(
        'ERROR IMAGENES GENERALES:',
        error
      )
    } else {
      ;(data || []).forEach(
        (imagen: Imagen) => {
          if (
            imagen.image_url?.trim()
          ) {
            fotos.push(
              imagen.image_url.trim()
            )
          }
        }
      )
    }

    return fotosUnicas(fotos)
  }

  // =====================================================
  // CARGAR VARIANTES
  // =====================================================

  async function cargarVariantes(
    productoId: number
  ) {
    const {
      data,
      error
    } = await supabase
      .from('ProductoVariantes')
      .select(
        'id, producto_id, talle, color, precio'
      )
      .eq(
        'producto_id',
        productoId
      )
      .order('id', {
        ascending: true
      })

    if (error) {
      console.error(
        'ERROR VARIANTES:',
        error
      )

      setVariantes([])
      setImagenesVariantes({})

      return {
        variantes: [] as Variante[],
        mapa: {} as Record<
          number,
          string[]
        >
      }
    }

    const variantesCargadas =
      (data || []).map(
        variante => ({
          ...variante,
          talle:
            variante.talle || '',
          color:
            variante.color || '',
          precio:
            Number(
              variante.precio || 0
            )
        })
      ) as Variante[]

    setVariantes(
      variantesCargadas
    )

    if (
      variantesCargadas.length === 0
    ) {
      setImagenesVariantes({})

      return {
        variantes:
          variantesCargadas,
        mapa: {} as Record<
          number,
          string[]
        >
      }
    }

    const ids =
      variantesCargadas.map(
        variante =>
          variante.id
      )

    const {
      data: imagenes,
      error: errorImagenes
    } = await supabase
      .from(
        'ProductoVarianteImagenes'
      )
      .select(
        'variante_id, image_url, orden'
      )
      .in(
        'variante_id',
        ids
      )
      .order('orden', {
        ascending: true
      })

    if (errorImagenes) {
      console.error(
        'ERROR IMAGENES VARIANTES:',
        errorImagenes
      )

      setImagenesVariantes({})

      return {
        variantes:
          variantesCargadas,
        mapa: {} as Record<
          number,
          string[]
        >
      }
    }

    const mapa: Record<
      number,
      string[]
    > = {}

    variantesCargadas.forEach(
      variante => {
        mapa[variante.id] = []
      }
    )

    ;(imagenes || []).forEach(
      (imagen: Imagen) => {
        if (
          imagen.variante_id &&
          imagen.image_url?.trim()
        ) {
          if (
            !mapa[
              imagen.variante_id
            ]
          ) {
            mapa[
              imagen.variante_id
            ] = []
          }

          mapa[
            imagen.variante_id
          ].push(
            imagen.image_url.trim()
          )
        }
      }
    )

    Object.keys(mapa).forEach(
      id => {
        const varianteId =
          Number(id)

        mapa[varianteId] =
          fotosUnicas(
            mapa[varianteId]
          )
      }
    )

    setImagenesVariantes(
      mapa
    )

    return {
      variantes:
        variantesCargadas,
      mapa
    }
  }

  // =====================================================
  // ABRIR PRODUCTO
  // =====================================================

  const abrirProducto = async (
    producto: Producto
  ) => {
    registrarEvento(
      'producto_visto',
      producto
    )

    window.history.pushState(
      {
        tiendaProducto: true,
        productoId: producto.id
      },
      '',
      window.location.href
    )

    setProductoSeleccionado(
      producto
    )

    setCantidadProducto(1)
    setTalleSeleccionado('')
    setColorSeleccionado('')
    setVariantes([])
    setImagenesVariantes({})
    setImagenesProducto([])
    setImagenesGenerales([])
    setFotoActual(0)
    setImagenAmpliada(false)
    setCargandoDetalle(true)

    try {
      // -----------------------------------------------
      // 1. CARGAR FOTOS GENERALES
      // -----------------------------------------------

      const fotosGenerales =
        await cargarImagenesGenerales(
          producto
        )

      setImagenesGenerales(
        fotosGenerales
      )

      // -----------------------------------------------
      // 2. CARGAR VARIANTES Y SUS FOTOS
      // -----------------------------------------------

      const resultado =
        await cargarVariantes(
          producto.id
        )

      // -----------------------------------------------
      // 3. ARMAR GALERÍA COMPLETA
      //
      // IMPORTANTE:
      // Acá se cargan TODAS las imágenes una sola vez.
      // Después seleccionar talle/color NO modifica
      // esta galería.
      // -----------------------------------------------

      const fotosVariantes =
        Object.values(
          resultado.mapa
        ).flat()

      const galeriaCompleta =
        fotosUnicas([
          ...fotosGenerales,
          ...fotosVariantes
        ])

      setImagenesProducto(
        galeriaCompleta
      )

      setFotoActual(0)
    } catch (error) {
      console.error(
        'ERROR ABRIENDO PRODUCTO:',
        error
      )
    } finally {
      setCargandoDetalle(false)
    }
  }

  // =====================================================
  // CERRAR PRODUCTO
  // =====================================================

  const cerrarProducto = () => {
    if (
      window.history.state?.tiendaProducto
    ) {
      window.history.back()
      return
    }

    limpiarProductoSeleccionado()
  }

  // =====================================================
  // TALLE
  // =====================================================

  const seleccionarTalle = (
    talle: string
  ) => {
    setTalleSeleccionado(
      talle
    )

    // Al cambiar talle reiniciamos color.
    setColorSeleccionado('')

    // Buscamos la primera variante de ese talle.
    // NO agregamos ni quitamos fotos.
    const variante =
      variantes.find(
        item =>
          item.talle === talle
      )

    if (!variante) {
      return
    }

    const fotosTalle =
      imagenesVariantes[
        variante.id
      ] || []

    // Buscamos esas fotos DENTRO de la galería
    // que ya fue cargada al abrir el producto.
    const indiceFoto =
      imagenesProducto.findIndex(
        foto =>
          fotosTalle.some(
            fotoVariante =>
              normalizarUrl(
                foto
              ) ===
              normalizarUrl(
                fotoVariante
              )
          )
      )

    if (indiceFoto >= 0) {
      setFotoActual(
        indiceFoto
      )
    }
  }

  // =====================================================
  // COLORES DISPONIBLES
  // =====================================================

  const coloresDisponibles =
    variantes
      .filter(
        variante =>
          variante.talle ===
          talleSeleccionado
      )
      .map(
        variante =>
          variante.color
      )
      .filter(
        (
          color,
          index,
          array
        ) =>
          color &&
          array.indexOf(
            color
          ) === index
      )

  // =====================================================
  // COLOR
  // =====================================================

  const seleccionarColor = (
    color: string
  ) => {
    setColorSeleccionado(
      color
    )

    const variante =
      variantes.find(
        item =>
          item.talle ===
            talleSeleccionado &&
          item.color === color
      )

    if (!variante) {
      return
    }

    const fotosColor =
      imagenesVariantes[
        variante.id
      ] || []

    // IMPORTANTE:
    // No modificamos imagenesProducto.
    // Solo buscamos la foto correspondiente
    // dentro de las fotos ya cargadas.
    const indiceFoto =
      imagenesProducto.findIndex(
        foto =>
          fotosColor.some(
            fotoVariante =>
              normalizarUrl(
                foto
              ) ===
              normalizarUrl(
                fotoVariante
              )
          )
      )

    if (indiceFoto >= 0) {
      setFotoActual(
        indiceFoto
      )
    }
  }

  // =====================================================
  // VARIANTE EXACTA
  // =====================================================

  const obtenerVarianteSeleccionada =
    () => {
      if (
        !talleSeleccionado ||
        !colorSeleccionado
      ) {
        return null
      }

      return (
        variantes.find(
          variante =>
            variante.talle ===
              talleSeleccionado &&
            variante.color ===
              colorSeleccionado
        ) || null
      )
    }

  const calcularPrecioFinal = (precioBase: number, producto: Producto | null = productoSeleccionado) => {
    const descuento = Math.min(100, Math.max(0, Number(producto?.descuento_porcentaje || 0)))
    return Number(precioBase || 0) * (1 - descuento / 100)
  }

  // =====================================================
  // PRECIO ACTUAL
  // =====================================================

  const obtenerPrecioActual =
    () => {
      if (
        !productoSeleccionado
      ) {
        return 0
      }

      if (
        variantes.length === 0
      ) {
        return calcularPrecioFinal(productoSeleccionado.price, productoSeleccionado)
      }

      const varianteExacta =
        obtenerVarianteSeleccionada()

      if (
        varianteExacta
      ) {
        return calcularPrecioFinal(varianteExacta.precio, productoSeleccionado)
      }

      if (
        talleSeleccionado
      ) {
        const variantesDelTalle =
          variantes.filter(
            variante =>
              variante.talle ===
              talleSeleccionado
          )

        if (
          variantesDelTalle.length >
          0
        ) {
          const precios =
            variantesDelTalle
              .map(
                variante =>
                  Number(
                    variante.precio ||
                      0
                  )
              )
              .filter(
                precio =>
                  precio > 0
              )

          if (
            precios.length > 0
          ) {
            return calcularPrecioFinal(Math.min(...precios), productoSeleccionado)
          }
        }
      }

      return calcularPrecioFinal(productoSeleccionado.price, productoSeleccionado)
    }

  // =====================================================
  // CARRITO
  // =====================================================

  const agregarAlCarrito = (
    producto: ItemCarrito
  ) => {
    registrarEvento(
      'agregado_carrito',
      producto
    )

    setCarrito(
      carritoActual => {
        const cantidadActual =
          carritoActual
            .filter(
              item =>
                item.id ===
                  producto.id &&
                item.talle ===
                  producto.talle &&
                item.color ===
                  producto.color &&
                item.variante_id ===
                  producto.variante_id
            )
            .reduce(
              (
                total,
                item
              ) =>
                total +
                (item.cantidad ||
                  1),
              0
            )

        const productoActual =
          productos.find(
            item =>
              item.id ===
              producto.id
          )

        if (productoActual) {
          const disponible =
            stockDisponible(
              productoActual
            )

          if (
            cantidadActual >=
            disponible
          ) {
            return carritoActual
          }
        }

        const existe =
          carritoActual.some(
            item =>
              item.id ===
                producto.id &&
              item.talle ===
                producto.talle &&
              item.color ===
                producto.color &&
              item.variante_id ===
                producto.variante_id
          )

        if (existe) {
          return carritoActual.map(
            item =>
              item.id ===
                  producto.id &&
                item.talle ===
                  producto.talle &&
                item.color ===
                  producto.color &&
                item.variante_id ===
                  producto.variante_id
                ? {
                    ...item,
                    cantidad:
                      (item.cantidad ||
                        1) + 1
                  }
                : item
          )
        }

        return [
          ...carritoActual,
          {
            ...producto,
            cantidad: 1
          }
        ]
      }
    )
  }

  // =====================================================
  // QUITAR DEL CARRITO
  // =====================================================

  const quitarDelCarrito = (
    id: number,
    talle: string | null,
    color: string | null,
    varianteId: number | null
  ) => {
    setCarrito(
      carritoActual =>
        carritoActual
          .map(item =>
            item.id === id &&
            item.talle === talle &&
            item.color === color &&
            item.variante_id ===
              varianteId
              ? {
                  ...item,
                  cantidad:
                    (item.cantidad ||
                      1) - 1
                }
              : item
          )
          .filter(
            item =>
              item.cantidad > 0
          )
    )
  }

  // =====================================================
  // ELIMINAR DEL CARRITO
  // =====================================================

  const eliminarDelCarrito = (
    id: number,
    talle: string | null,
    color: string | null,
    varianteId: number | null
  ) => {
    setCarrito(
      carritoActual =>
        carritoActual.filter(
          item =>
            !(
              item.id === id &&
              item.talle === talle &&
              item.color === color &&
              item.variante_id ===
                varianteId
            )
        )
    )
  }

  // =====================================================
  // CANTIDAD CARRITO
  // =====================================================

  const cantidadCarrito =
    carrito.reduce(
      (
        total,
        producto
      ) =>
        total +
        (producto.cantidad ||
          1),
      0
    )

  // =====================================================
  // TOTAL CARRITO
  // =====================================================

  const totalCarrito =
    carrito.reduce(
      (
        total,
        producto
      ) =>
        total +
        Number(
          producto.price || 0
        ) *
          (producto.cantidad ||
            1),
      0
    )

  // =====================================================
  // ABRIR CHECKOUT
  // =====================================================

  const abrirCheckout = () => {
    if (!carrito.length) {
      return
    }

    registrarEvento(
      'checkout'
    )

    setErrorPedido('')
    setPedidoCreado(false)
    setUrlWhatsAppPedido('')
    setEmailEnviado(false)
    setMostrarCarrito(false)
    setMostrarCheckout(true)
  }

  // =====================================================
  // CERRAR CHECKOUT
  // =====================================================

  const cerrarCheckout = () => {
    if (enviandoPedido) {
      return
    }

    setMostrarCheckout(false)
    setPedidoCreado(false)
    setErrorPedido('')
  }

  // =====================================================
  // ENVIAR PEDIDO
  // =====================================================

  const enviarPedido = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    if (!carrito.length) {
      setErrorPedido(
        TEXTOS.carritoVacio
      )

      return
    }

    const campos =
      Object.values(datosCliente)

    if (
      campos.some(
        campo =>
          !campo.trim()
      )
    ) {
      setErrorPedido(
        TEXTOS.completarCampos
      )

      return
    }

    setEnviandoPedido(true)
    setErrorPedido('')
    setEmailEnviado(false)

    try {
      // ============================================
      // VOLVER A CARGAR STOCK ACTUAL
      // ============================================

      const {
        data: productosActualizados,
        error: errorStock
      } = await supabase
        .from('Productos')
        .select('*')
        .in(
          'id',
          carrito.map(
            producto =>
              producto.id
          )
        )

      if (errorStock) {
        throw errorStock
      }

      const productosStock =
        (productosActualizados ||
          []) as Producto[]

      // ============================================
      // VERIFICAR STOCK
      // ============================================

      for (const producto of carrito) {
        const productoActual =
          productosStock.find(
            item =>
              item.id ===
              producto.id
          )

        if (!productoActual) {
          throw new Error(
            `El producto "${producto.name}" ya no está disponible.`
          )
        }

        const disponible =
          stockDisponible(
            productoActual
          )

        const cantidadSolicitada =
          producto.cantidad || 1

        if (
          disponible <
          cantidadSolicitada
        ) {
          throw new Error(
            `Stock insuficiente para "${producto.name}". Disponible: ${disponible}.`
          )
        }
      }

      // ============================================
      // ITEMS
      // ============================================

      const items = carrito.map(
        producto => {
          const cantidad =
            producto.cantidad || 1

          const precio =
            Number(
              producto.price || 0
            )

          return {
            producto_id:
              producto.id,

            nombre_producto:
              producto.name,

            talle:
              producto.talle || '',

            color:
              producto.color || '',

            variante_id:
              producto.variante_id
                ? String(
                    producto.variante_id
                  )
                : '',

            cantidad,

            precio_unitario:
              precio,

            imagen:
              producto.image ||
              imagenesPortada[
                producto.id
              ] ||
              ''
          }
        }
      )

      // ============================================
      // CREAR PEDIDO
      // ============================================

      const {
        data: pedidoId,
        error
      } = await supabase.rpc(
        'crear_pedido',
        {
          p_nombre:
            datosCliente.nombre.trim(),

          p_apellido:
            datosCliente.apellido.trim(),

          p_direccion:
            datosCliente.direccion.trim(),

          p_codigo_postal:
            datosCliente.codigo_postal.trim(),

          p_telefono:
            datosCliente.telefono.trim(),

          p_email:
            datosCliente.email.trim(),

          p_total:
            totalCarrito,

          p_items:
            items
        }
      )

      if (error) {
        console.error(
          'ERROR CREANDO PEDIDO:',
          error
        )

        throw error
      }

      console.log(
        'PEDIDO CREADO:',
        pedidoId
      )

      // ============================================
      // ESTADÍSTICA PEDIDO
      // ============================================

      registrarEvento(
        'pedido'
      )

      // ============================================
      // EMAIL
      // ============================================

      const {
        error: errorEmail
      } = await supabase.functions.invoke(
        'enviar-email-pedido',
        {
          body: {
            pedidoId
          }
        }
      )

      if (errorEmail) {
        console.error(
          'ERROR ENVIANDO EMAIL:',
          errorEmail
        )

        setEmailEnviado(false)
      } else {
        setEmailEnviado(true)
      }

      // ============================================
      // WHATSAPP
      // ============================================

      const numeroPedido =
        String(pedidoId)

      const nombreCompleto =
        `${datosCliente.nombre.trim()} ${datosCliente.apellido.trim()}`

      const totalPedido =
        totalCarrito.toLocaleString(
          'es-AR'
        )

      const mensajeWhatsApp =
        `${TIENDA_CONFIG.marca.nombre} 👋\n` +
        `Ya realicé mi compra.\n\n` +
        `N.º de pedido: #${numeroPedido}\n` +
        `Nombre: ${nombreCompleto}\n` +
        `Total: ${MONEDA}${totalPedido}\n\n` +
        `Muchas gracias.`

      const urlWhatsApp =
        `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
          mensajeWhatsApp
        )}`

      setUrlWhatsAppPedido(
        urlWhatsApp
      )

      // ============================================
      // ÉXITO
      // ============================================

      setPedidoCreado(true)
      setCarrito([])
      setMostrarCarrito(false)

      await cargarProductos()

      setDatosCliente({
        nombre: '',
        apellido: '',
        direccion: '',
        codigo_postal: '',
        telefono: '',
        email: ''
      })
    } catch (error) {
      console.error(
        'ERROR CREANDO PEDIDO:',
        error
      )

      const mensaje =
        error instanceof Error
          ? error.message
          : ''

      if (
        mensaje
          .toLowerCase()
          .includes('stock')
      ) {
        setErrorPedido(
          TEXTOS.errorStock
        )
      } else {
        setErrorPedido(
          TEXTOS.errorPedido
        )
      }
    } finally {
      setEnviandoPedido(false)
    }
  }

  // =====================================================
  // FILTROS
  // =====================================================

  const productosFiltrados =
    productos
      .filter(
        producto =>
          producto.name
            ?.toLowerCase()
            .includes(
              busqueda.toLowerCase()
            )
      )
      .filter(producto => {
        if (categoriaSeleccionada === 'Todos') return true
        const cats = Array.isArray(producto.category) ? producto.category : producto.category ? [producto.category] : []
        const categoria = categorias.find(c => c.nombre === categoriaSeleccionada)
        if (!categoria) return cats.includes(categoriaSeleccionada)
        const descendientes = new Set<number>()
        const buscarHijos = (padreId: number) => {
          categorias.filter(c => c.parent_id === padreId).forEach(hijo => {
            descendientes.add(hijo.id)
            buscarHijos(hijo.id)
          })
        }
        buscarHijos(categoria.id)
        const nombresPermitidos = [categoria.nombre, ...categorias.filter(c => descendientes.has(c.id)).map(c => c.nombre)]
        return nombresPermitidos.some(nombre => cats.includes(nombre))
      })

  // =====================================================
  // FOTOS
  // =====================================================

  const fotoAnterior = () => {
    if (
      imagenesProducto.length <=
      1
    ) {
      return
    }

    setFotoActual(
      actual =>
        actual === 0
          ? imagenesProducto.length -
            1
          : actual - 1
    )
  }

  const fotoSiguiente = () => {
    if (
      imagenesProducto.length <=
      1
    ) {
      return
    }

    setFotoActual(
      actual =>
        actual ===
        imagenesProducto.length -
          1
          ? 0
          : actual + 1
    )
  }

  // =====================================================
  // SWIPE
  // =====================================================

  const manejarTouchStart = (
    e: TouchEvent<HTMLDivElement>
  ) => {
    setInicioToque(
      e.touches[0].clientX
    )
  }

  const manejarTouchEnd = (
    e: TouchEvent<HTMLDivElement>
  ) => {
    if (
      inicioToque === null
    ) {
      return
    }

    const final =
      e.changedTouches[0]
        .clientX

    const diferencia =
      inicioToque - final

    if (
      Math.abs(diferencia) >=
      50
    ) {
      if (
        diferencia > 0
      ) {
        fotoSiguiente()
      } else {
        fotoAnterior()
      }
    }

    setInicioToque(null)
  }

  // =====================================================
  // RENDER
  // =====================================================

  const alternarCategoriaMenu = (categoriaId: number) => {
    setCategoriasExpandida(actual => {
      const siguiente = new Set(actual)
      if (siguiente.has(categoriaId)) {
        siguiente.delete(categoriaId)
      } else {
        siguiente.add(categoriaId)
      }
      return siguiente
    })
  }

  const seleccionarCategoria = (nombre: string) => {
    setCategoriaSeleccionada(nombre)
    setMenuCategoriasAbierto(false)
  }

  function renderMenuCategorias(padreId: number | null, nivel = 0): any {
    return categorias
      .filter(c => c.parent_id === padreId)
      .sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0) || a.id - b.id)
      .map(categoria => {
        const hijos = categorias
          .filter(c => c.parent_id === categoria.id)
          .sort((a, b) => (Number(a.orden) || 0) - (Number(b.orden) || 0) || a.id - b.id)
        const tieneHijos = hijos.length > 0
        const expandida = categoriasExpandida.has(categoria.id)

        return (
          <div key={categoria.id} style={{ marginBottom: nivel === 0 ? '8px' : '5px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: nivel === 0
                  ? GRADIENTE_MENU_PRINCIPAL
                  : nivel === 1
                    ? GRADIENTE_MENU_ALTERNATIVO
                    : GRADIENTE_MENU_BOTON,
                borderRadius: '13px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,.13)',
                boxShadow: '0 3px 10px rgba(0,0,0,.10)'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (tieneHijos) {
                    alternarCategoriaMenu(categoria.id)
                  } else {
                    seleccionarCategoria(categoria.nombre)
                  }
                }}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '9px',
                  textAlign: 'left',
                  border: 0,
                  background: 'transparent',
                  padding: '13px 12px',
                  paddingLeft: `${12 + nivel * 12}px`,
                  fontWeight: nivel === 0 ? 750 : 550,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  letterSpacing: '.1px',
                  transition: 'background .18s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: nivel === 0 ? '7px' : '5px',
                    height: nivel === 0 ? '7px' : '5px',
                    borderRadius: '50%',
                    background: nivel === 0 ? '#fff' : 'rgba(255,255,255,.65)',
                    flex: '0 0 auto'
                  }}
                />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {categoria.nombre}
                </span>
              </button>

              {tieneHijos && (
                <button
                  type="button"
                  aria-label={expandida ? `Ocultar ${categoria.nombre}` : `Mostrar ${categoria.nombre}`}
                  onClick={() => alternarCategoriaMenu(categoria.id)}
                  style={{
                    width: '42px',
                    height: '42px',
                    marginRight: '4px',
                    border: 0,
                    borderRadius: '9px',
                    background: expandida ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.07)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '20px',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all .18s ease'
                  }}
                >
                  <span style={{ transform: expandida ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .2s ease', display: 'block' }}>
                    ▾
                  </span>
                </button>
              )}
            </div>

            {tieneHijos && expandida && (
              <div
                style={{
                  marginTop: '6px',
                  marginLeft: nivel === 0 ? '13px' : '9px',
                  paddingLeft: '11px',
                  borderLeft: '2px solid rgba(255,255,255,.16)',
                  animation: 'tiendaCategoryOpen .18s ease'
                }}
              >
                <button
                  type="button"
                  onClick={() => seleccionarCategoria(categoria.nombre)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textAlign: 'left',
                    border: '1px solid rgba(255,255,255,.14)',
                    background: 'rgba(255,255,255,.11)',
                    padding: '9px 11px',
                    borderRadius: '9px',
                    fontWeight: 700,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '12px',
                    marginBottom: '6px',
                    boxSizing: 'border-box',
                    transition: 'background .18s ease, transform .18s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,.17)'
                    e.currentTarget.style.transform = 'translateX(2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,.11)'
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <span aria-hidden="true" style={{ fontSize: '12px' }}>●</span>
                  <span>Ver todos los productos</span>
                </button>

                {renderMenuCategorias(categoria.id, nivel + 1)}
              </div>
            )}
          </div>
        )
      })
  }

  if (modoRecuperacion) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#f0ead2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            background: '#fff',
            borderRadius: '16px',
            padding: '30px',
            boxSizing: 'border-box',
            boxShadow: '0 8px 30px rgba(0,0,0,.12)',
            textAlign: 'center'
          }}
        >
          <img
            src={TIENDA_CONFIG.marca.logo}
            alt={TIENDA_CONFIG.marca.nombre}
            style={{
              width: '120px',
              maxWidth: '60%',
              marginBottom: '18px'
            }}
          />

          <h1 style={{ margin: '0 0 10px', color: '#333' }}>
            Nueva contraseña
          </h1>

          <p style={{ margin: '0 0 24px', color: '#666' }}>
            Elegí una nueva contraseña para tu cuenta de administrador.
          </p>

          <form
            onSubmit={cambiarContrasena}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
          >
            <input
              type="password"
              value={nuevaContrasena}
              onChange={e => setNuevaContrasena(e.target.value)}
              placeholder="Nueva contraseña"
              autoComplete="new-password"
              minLength={6}
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '13px',
                border: '1px solid #ddd',
                borderRadius: '9px',
                fontSize: '16px'
              }}
            />

            <input
              type="password"
              value={repetirContrasena}
              onChange={e => setRepetirContrasena(e.target.value)}
              placeholder="Repetir contraseña"
              autoComplete="new-password"
              minLength={6}
              required
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '13px',
                border: '1px solid #ddd',
                borderRadius: '9px',
                fontSize: '16px'
              }}
            />

            {errorRecuperacion && (
              <p style={{ margin: 0, color: '#c62828', fontSize: '14px' }}>
                {errorRecuperacion}
              </p>
            )}

            {mensajeRecuperacion && (
              <p style={{ margin: 0, color: '#2e7d32', fontSize: '14px' }}>
                {mensajeRecuperacion}
              </p>
            )}

            <button
              type="submit"
              disabled={guardandoContrasena}
              style={{
                border: 'none',
                borderRadius: '9px',
                padding: '13px',
                background: '#ba92bb',
                color: '#fff',
                fontWeight: 700,
                fontSize: '16px',
                cursor: guardandoContrasena ? 'default' : 'pointer',
                opacity: guardandoContrasena ? 0.7 : 1
              }}
            >
              {guardandoContrasena ? 'Guardando...' : 'Cambiar contraseña'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Header
        setMostrarCarrito={setMostrarCarrito}
        cantidadCarrito={cantidadCarrito}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        menuCategoriasAbierto={menuCategoriasAbierto}
        setMenuCategoriasAbierto={setMenuCategoriasAbierto}
      />

      <style>{`
        @keyframes tiendaCategoryOpen {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {menuCategoriasAbierto && (
        <div className="menu-categorias-desplegable" role="navigation" aria-label="Categorías">
          <button type="button" className="menu-todos" onClick={() => seleccionarCategoria('Todos')}>
            <span>⌂</span> Todos los productos
          </button>
          {categorias.length > 0 ? renderMenuCategorias(null) : (
            <div className="menu-sin-categorias">{TEXTOS.sinCategorias}</div>
          )}
        </div>
      )}

      {/* =================================================
          CARRITO
      ================================================= */}

      {mostrarCarrito && (
        <div className="carrito-lateral">
          <div className="carrito-header">
            <h2>
              🛒 Mi carrito
            </h2>

            <button
              className="cerrar-carrito"
              onClick={() =>
                setMostrarCarrito(
                  false
                )
              }
            >
              ×
            </button>
          </div>

          {carrito.length === 0 ? (
            <p>
              {TEXTOS.carritoVacio}
            </p>
          ) : (
            <>
              {carrito.map(
                producto => (
                  <div
                    className="item-carrito"
                    key={`${producto.id}-${producto.talle || 'sin-talle'}-${producto.color || 'sin-color'}-${producto.variante_id || 'sin-variante'}`}
                  >
                    <img
                      src={
                        producto.image ||
                        imagenesPortada[
                          producto.id
                        ] ||
                        ''
                      }
                      alt={
                        producto.name
                      }
                    />

                    <div className="info-carrito">
                      <h4>
                        {
                          producto.name
                        }
                      </h4>

                      {producto.talle && (
                        <p>
                          Talle:{' '}
                          {
                            producto.talle
                          }
                        </p>
                      )}

                      {producto.color && (
                        <p>
                          Color:{' '}
                          {
                            producto.color
                          }
                        </p>
                      )}

                      <p>
                        {MONEDA}
                        {Number(
                          producto.price
                        ).toLocaleString(
                          'es-AR'
                        )}
                      </p>

                      <div className="cantidad-carrito">
                        <button
                          onClick={() =>
                            quitarDelCarrito(
                              producto.id,
                              producto.talle,
                              producto.color,
                              producto.variante_id
                            )
                          }
                        >
                          −
                        </button>

                        <span>
                          {
                            producto.cantidad
                          }
                        </span>

                        <button
                          onClick={() =>
                            agregarAlCarrito(
                              producto
                            )
                          }
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="eliminar-carrito"
                        onClick={() =>
                          eliminarDelCarrito(
                            producto.id,
                            producto.talle,
                            producto.color,
                            producto.variante_id
                          )
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                )
              )}

              <div className="total-carrito">
                <div>
                  <span>
                    Total
                  </span>

                  <strong>
                    {MONEDA}
                    {totalCarrito.toLocaleString(
                      'es-AR'
                    )}
                  </strong>
                </div>

                <button
                  className="boton-comprar"
                  onClick={
                    abrirCheckout
                  }
                >
                  Comprar
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* =================================================
          CHECKOUT
      ================================================= */}

      {mostrarCheckout && (
        <div
          className="producto-overlay"
          onClick={e => {
            if (
              e.target ===
              e.currentTarget
            ) {
              cerrarCheckout()
            }
          }}
        >
          <div className="producto-detalle checkout-detalle">
            <div className="producto-detalle-header">
              <button
                className="producto-volver"
                onClick={
                  cerrarCheckout
                }
                disabled={
                  enviandoPedido
                }
              >
                ←
              </button>

              <span>
                {TEXTOS.checkout}
              </span>

              <button
                className="producto-cerrar"
                onClick={
                  cerrarCheckout
                }
                disabled={
                  enviandoPedido
                }
              >
                ×
              </button>
            </div>

            {!pedidoCreado ? (
              <form
                className="checkout-form"
                onSubmit={
                  enviarPedido
                }
              >
                <h1>
                  {TEXTOS.datosEntrega}
                </h1>

                <p className="checkout-subtitulo">
                  {TEXTOS.checkoutSubtitulo}
                </p>

                <div className="checkout-resumen">
                  <strong>
                    {TEXTOS.resumenPedido}
                  </strong>

                  {carrito.map(
                    producto => (
                      <div
                        className="checkout-item"
                        key={`${producto.id}-${producto.talle || 'sin-talle'}-${producto.color || 'sin-color'}-${producto.variante_id || 'sin-variante'}`}
                      >
                        <span>
                          {producto.name}
                          {' × '}
                          {
                            producto.cantidad
                          }

                          {producto.talle
                            ? ` · ${producto.talle}`
                            : ''}

                          {producto.color
                            ? ` · ${producto.color}`
                            : ''}
                        </span>

                        <strong>
                          {MONEDA}
                          {(
                            Number(
                              producto.price ||
                                0
                            ) *
                            (producto.cantidad ||
                              1)
                          ).toLocaleString(
                            'es-AR'
                          )}
                        </strong>
                      </div>
                    )
                  )}

                  <div className="checkout-total">
                    <span>
                      Total
                    </span>

                    <strong>
                      {MONEDA}
                      {totalCarrito.toLocaleString(
                        'es-AR'
                      )}
                    </strong>
                  </div>
                </div>

                <div className="checkout-grid">
                  <label>
                    Nombre

                    <input
                      type="text"
                      value={
                        datosCliente.nombre
                      }
                      onChange={e =>
                        setDatosCliente(
                          actual => ({
                            ...actual,
                            nombre:
                              e.target.value
                          })
                        )
                      }
                      autoComplete="given-name"
                      required
                    />
                  </label>

                  <label>
                    Apellido

                    <input
                      type="text"
                      value={
                        datosCliente.apellido
                      }
                      onChange={e =>
                        setDatosCliente(
                          actual => ({
                            ...actual,
                            apellido:
                              e.target.value
                          })
                        )
                      }
                      autoComplete="family-name"
                      required
                    />
                  </label>

                  <label className="checkout-campo-completo">
                    Dirección

                    <input
                      type="text"
                      value={
                        datosCliente.direccion
                      }
                      onChange={e =>
                        setDatosCliente(
                          actual => ({
                            ...actual,
                            direccion:
                              e.target.value
                          })
                        )
                      }
                      autoComplete="street-address"
                      required
                    />
                  </label>

                  <label>
                    Código Postal

                    <input
                      type="text"
                      value={
                        datosCliente.codigo_postal
                      }
                      onChange={e =>
                        setDatosCliente(
                          actual => ({
                            ...actual,
                            codigo_postal:
                              e.target.value
                          })
                        )
                      }
                      autoComplete="postal-code"
                      required
                    />
                  </label>

                  <label>
                    Teléfono

                    <input
                      type="tel"
                      value={
                        datosCliente.telefono
                      }
                      onChange={e =>
                        setDatosCliente(
                          actual => ({
                            ...actual,
                            telefono:
                              e.target.value
                          })
                        )
                      }
                      autoComplete="tel"
                      required
                    />
                  </label>

                  <label className="checkout-campo-completo">
                    Email

                    <input
                      type="email"
                      value={
                        datosCliente.email
                      }
                      onChange={e =>
                        setDatosCliente(
                          actual => ({
                            ...actual,
                            email:
                              e.target.value
                          })
                        )
                      }
                      autoComplete="email"
                      required
                    />
                  </label>
                </div>

                {errorPedido && (
                  <div className="checkout-error">
                    {errorPedido}
                  </div>
                )}

                <button
                  type="submit"
                  className="producto-boton-carrito checkout-boton"
                  disabled={
                    enviandoPedido ||
                    carrito.length === 0
                  }
                >
                  {enviandoPedido
                    ? TEXTOS.enviandoPedido
                    : TEXTOS.enviarPedido}
                </button>
              </form>
            ) : (
              <div className="checkout-exito">
                <div className="checkout-exito-icono">
                  ✓
                </div>

                <h1>
                  ¡Gracias por tu compra!
                </h1>

                <p>
                  Recibimos tu pedido
                  correctamente.
                </p>

                <p>
                  Tu pedido quedó
                  pendiente de
                  confirmación.
                </p>

                {emailEnviado ? (
                  <p>
                    Te enviamos un email con
                    todos los detalles de tu
                    compra.
                  </p>
                ) : (
                  <p>
                    Podés continuar la
                    coordinación de tu compra
                    por WhatsApp.
                  </p>
                )}

                <p>
                  Para continuar con la
                  coordinación de tu
                  compra, escribinos por
                  WhatsApp.
                </p>

                {urlWhatsAppPedido && (
                  <button
                    type="button"
                    className="producto-boton-carrito"
                    onClick={() =>
                      window.open(
                        urlWhatsAppPedido,
                        '_blank'
                      )
                    }
                  >
                    {TEXTOS.continuarWhatsApp}
                  </button>
                )}

                <button
                  type="button"
                  className="producto-boton-carrito"
                  onClick={
                    cerrarCheckout
                  }
                >
                  {TEXTOS.seguirComprando}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================
          PRODUCTOS
      ================================================= */}

      <section className="productos">
        <div className="tarjetas">
   {cargandoProductos ? null : productosFiltrados.length === 0 ? (
  <div className="sin-productos">
    <h3>🐾 {TIENDA_CONFIG.textos.sinProductos}</h3>
    <p>{TEXTOS.sinProductosDescripcion}</p>
  </div>
) : (
            productosFiltrados.map(
              producto => {
                const imagenPortada =
                  imagenesPortada[
                    producto.id
                  ] ||
                  producto.image?.trim() ||
                  ''

                const disponible =
                  stockDisponible(
                    producto
                  )

                const sinStock =
                  disponible <= 0

                return (
                  <div
                    className="tarjeta"
                    key={
                      producto.id
                    }
                    onClick={() =>
                      abrirProducto(
                        producto
                      )
                    }
                  >
                    <div className="imagen-producto">
                      {imagenPortada ? (
                        <div
                          style={{
                            position:
                              'relative',
                            width:
                              '100%'
                          }}
                        >
                          <img
                            src={
                              imagenPortada
                            }
                            alt={
                              producto.name
                            }
                            loading="lazy"
                            decoding="async"
                            width="800"
                            height="800"
                            onError={e => {
                              console.error(
                                'ERROR IMAGEN PORTADA:',
                                imagenPortada
                              )

                              e.currentTarget.style.display =
                                'none'
                            }}
                          />

          {sinStock && (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.48)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      pointerEvents: 'none',
    }}
  >
    <span
      style={{
        color: '#fff',
        fontWeight: 800,
        fontSize: '18px',
        letterSpacing: '.5px',
      }}
    >
      SIN STOCK
    </span>
  </div>
)}
                        </div>
                      ) : (

                      
                        <div
                          style={{
                            height:
                              '100%',
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center'
                          }}
                        >
                          {TEXTOS.sinImagen}
                        </div>
                      )}
                    </div>

                    <div className="info-producto">
                      <h3>
                        {
                          producto.name
                        }
                      </h3>
                    

  <div
    style={{
      width: '100%',
      boxSizing: 'border-box',
      marginTop: '6px',
      marginBottom: '8px',
      background: '#ba92bb',
      color: '#fff',
      borderRadius: '7px',
      padding: '7px 8px',
      textAlign: 'center',
      fontSize: '11px',
      fontWeight: 700,
      lineHeight: 1.2
    }}
  >
   15% OFF CON TRANSFERENCIA / EFECTIVO
  </div>

                      <div className="precio-carrito">
                        {Number(producto.descuento_porcentaje || 0) > 0 && <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '13px', marginRight: '6px' }}>{MONEDA}{Number(producto.price || 0).toLocaleString('es-AR')}</span>}
                        <strong className="precio">
                          {MONEDA}
                          {calcularPrecioFinal(producto.price, producto).toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                        </strong>

                        <button
                          className="boton-agregar"
                          disabled={
                            sinStock
                          }
                          onClick={e => {
                            e.stopPropagation()

                            if (
                              sinStock
                            ) {
                              return
                            }

                            if (
                              producto.tiene_talle
                            ) {
                              abrirProducto(
                                producto
                              )

                              return
                            }

                            agregarAlCarrito({
                              ...producto,
                              talle:
                                null,
                              color:
                                null,
                              image:
                                imagenPortada,
                              price:
                                calcularPrecioFinal(producto.price, producto),
                              variante_id:
                                null,
                              cantidad:
                                1
                            })
                          }}
                        >
                          +
                        </button>
                        
                      </div>
                    </div>
                  </div>
                )
              }
            )
          )}
        </div>
      </section>

      {/* =================================================
          PRODUCTO SELECCIONADO
      ================================================= */}

      {productoSeleccionado && (
        <>
          {/* =================================================
              IMAGEN AMPLIADA
          ================================================= */}

          {imagenAmpliada &&
            imagenesProducto.length > 0 && (
              <div
                className="imagen-ampliada-overlay"
                onClick={() =>
                  setImagenAmpliada(
                    false
                  )
                }
              >
                <button
                  className="imagen-ampliada-cerrar"
                  onClick={() =>
                    setImagenAmpliada(
                      false
                    )
                  }
                >
                  ×
                </button>

                {imagenesProducto.length >
                  1 && (
                  <button
                    className="imagen-ampliada-flecha izquierda"
                    onClick={e => {
                      e.stopPropagation()
                      fotoAnterior()
                    }}
                  >
                    ‹
                  </button>
                )}

                <img
                  src={
                    imagenesProducto[
                      fotoActual
                    ]
                  }
                  alt={
                    productoSeleccionado.name
                  }
                  className="imagen-ampliada"
                  onClick={e =>
                    e.stopPropagation()
                  }
                />

                {imagenesProducto.length >
                  1 && (
                  <button
                    className="imagen-ampliada-flecha derecha"
                    onClick={e => {
                      e.stopPropagation()
                      fotoSiguiente()
                    }}
                  >
                    ›
                  </button>
                )}

                {imagenesProducto.length >
                  1 && (
                  <div className="imagen-ampliada-contador">
                    {fotoActual + 1} /{' '}
                    {
                      imagenesProducto.length
                    }
                  </div>
                )}
              </div>
            )}

          {/* =================================================
              DETALLE PRODUCTO
          ================================================= */}

          <div className="producto-overlay">
            <div className="producto-detalle">

              <div className="producto-detalle-header">
                <button
                  className="producto-volver"
                  onClick={
                    cerrarProducto
                  }
                >
                  ←
                </button>

                <span>
                  Producto
                </span>

                <button
                  className="producto-cerrar"
                  onClick={
                    cerrarProducto
                  }
                >
                  ×
                </button>
              </div>

              {/* GALERÍA */}

              <div
                className="producto-galeria"
                onTouchStart={
                  manejarTouchStart
                }
                onTouchEnd={
                  manejarTouchEnd
                }
              >
                {cargandoDetalle ? (
                  <div className="producto-cargando">
                    Cargando imágenes...
                  </div>
                ) : imagenesProducto.length >
                  0 ? (
                  <img
                    src={
                      imagenesProducto[
                        fotoActual
                      ]
                    }
                    alt={
                      productoSeleccionado.name
                    }
                    className="producto-foto-principal"
                    width="800"
                    height="800"
                    onClick={e => {
                      e.stopPropagation()

                      setImagenAmpliada(
                        true
                      )
                    }}
                    onError={e => {
                      console.error(
                        'ERROR MOSTRANDO IMAGEN:',
                        imagenesProducto[
                          fotoActual
                        ]
                      )

                      e.currentTarget.style.display =
                        'none'
                    }}
                    style={{
                      cursor:
                        'zoom-in',
                      pointerEvents:
                        'auto'
                    }}
                  />
                ) : (
                  <div className="producto-sin-imagen">
                    {TEXTOS.sinImagen}
                  </div>
                )}

                {imagenesProducto.length >
                  1 && (
                  <>
                    <button
                      className="galeria-flecha galeria-anterior"
                      onClick={e => {
                        e.stopPropagation()
                        fotoAnterior()
                      }}
                    >
                      ‹
                    </button>

                    <button
                      className="galeria-flecha galeria-siguiente"
                      onClick={e => {
                        e.stopPropagation()
                        fotoSiguiente()
                      }}
                    >
                      ›
                    </button>

                    <div className="galeria-contador">
                      {fotoActual + 1} /{' '}
                      {
                        imagenesProducto.length
                      }
                    </div>
                  </>
                )}
              </div>

              {/* MINIATURAS */}

              {imagenesProducto.length >
                1 && (
                <div className="producto-miniaturas">
                  {imagenesProducto.map(
                    (
                      imagen,
                      index
                    ) => (
                      <button
                        key={`${normalizarUrl(imagen)}-${index}`}
                        className={
                          fotoActual ===
                          index
                            ? 'miniatura activa'
                            : 'miniatura'
                        }
                        onClick={() =>
                          setFotoActual(
                            index
                          )
                        }
                      >
                        <img
                          src={
                            imagen
                          }
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width="150"
                          height="150"
                        />
                      </button>
                    )
                  )}
                </div>
              )}

              {/* INFORMACIÓN */}

              <div className="producto-info-detalle">
                <div className="producto-categoria">
                  {Array.isArray(
                    productoSeleccionado.category
                  )
                    ? productoSeleccionado.category.join(
                        ' · '
                      )
                    : productoSeleccionado.category ||
                      'Producto'}
                </div>

                <h1>
                  {
                    productoSeleccionado.name
                  }
                </h1>

                <div className="producto-precio">
                  {Number(productoSeleccionado.descuento_porcentaje || 0) > 0 && !talleSeleccionado && <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '14px', marginRight: '8px' }}>{MONEDA}{Number(productoSeleccionado.price || 0).toLocaleString('es-AR')}</span>}
                  {MONEDA}{obtenerPrecioActual().toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  {Number(productoSeleccionado.descuento_porcentaje || 0) > 0 && <span style={{ marginLeft: '8px', fontSize: '13px', color: '#7b2d2d' }}>-{Number(productoSeleccionado.descuento_porcentaje)}%</span>}
                </div>

                <div className="producto-transferencia">
                  <strong>
                    {MONEDA}{Math.round(obtenerPrecioActual() * (1 - DESCUENTO_TRANSFERENCIA / 100)).toLocaleString('es-AR')} con transferencia
                  </strong>
                  <span>
                    {DESCUENTO_TRANSFERENCIA}% de descuento pagando con transferencia
                  </span>
                </div>

                {productoSeleccionado.description && (
                  <div className="producto-descripcion">
                    <h3>
                      Descripción
                    </h3>

                    <p>
                      {
                        productoSeleccionado.description
                      }
                    </p>
                  </div>
                )}

                {/* TALLES */}

                {productoSeleccionado.tiene_talle && (
                  <div className="selector-producto">
                    <div className="selector-titulo">
                      <strong>
                        Talle
                      </strong>

                      {talleSeleccionado && (
                        <span>
                          {
                            talleSeleccionado
                          }
                        </span>
                      )}
                    </div>

                    <div className="opciones-producto">
                      {(
                        productoSeleccionado.talles ||
                        []
                      ).map(
                        talle => (
                          <button
                            key={
                              talle
                            }
                            className={
                              talleSeleccionado ===
                              talle
                                ? 'opcion-producto seleccionada'
                                : 'opcion-producto'
                            }
                            onClick={() =>
                              seleccionarTalle(
                                talle
                              )
                            }
                          >
                            {
                              talle
                            }
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* COLORES */}

                {productoSeleccionado.tiene_talle &&
                  talleSeleccionado &&
                  coloresDisponibles.length >
                    0 && (
                    <div className="selector-producto">
                      <div className="selector-titulo">
                        <strong>
                          Color
                        </strong>

                        {colorSeleccionado && (
                          <span>
                            {
                              colorSeleccionado
                            }
                          </span>
                        )}
                      </div>

                      <div className="opciones-producto">
                        {coloresDisponibles.map(
                          color => (
                            <button
                              key={
                                color
                              }
                              className={
                                colorSeleccionado ===
                                color
                                  ? 'opcion-producto seleccionada'
                                  : 'opcion-producto'
                              }
                              onClick={() =>
                                seleccionarColor(
                                  color
                                )
                              }
                            >
                              {
                                color
                              }
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {/* CANTIDAD */}

                <div className="producto-cantidad">
                  <span>Cantidad</span>
                  <div className="producto-cantidad-controles">
                    <button
                      type="button"
                      aria-label="Disminuir cantidad"
                      onClick={() =>
                        setCantidadProducto(actual =>
                          Math.max(1, actual - 1)
                        )
                      }
                    >
                      −
                    </button>
                    <strong>{cantidadProducto}</strong>
                    <button
                      type="button"
                      aria-label="Aumentar cantidad"
                      disabled={cantidadProducto >= stockDisponible(productoSeleccionado)}
                      onClick={() =>
                        setCantidadProducto(actual =>
                          Math.min(
                            stockDisponible(productoSeleccionado),
                            actual + 1
                          )
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* STOCK */}

                <div className="producto-stock">
                  <span className="stock-punto"></span>

                  {stockDisponible(
                    productoSeleccionado
                  ) > 0
                    ? `Stock disponible: ${stockDisponible(
                        productoSeleccionado
                      )}`
                    : 'Sin stock'}
                </div>
              </div>

              {/* BOTÓN CARRITO */}

              <div className="producto-footer">
                <button
                  className="producto-boton-carrito"
                  disabled={
                    stockDisponible(
                      productoSeleccionado
                    ) <= 0
                  }
                  onClick={() => {
                    if (
                      stockDisponible(
                        productoSeleccionado
                      ) <= 0
                    ) {
                      alert(
                        TEXTOS.alertaSinStock
                      )

                      return
                    }

                    if (
                      productoSeleccionado.tiene_talle &&
                      !talleSeleccionado
                    ) {
                      alert(
                        TEXTOS.seleccionarTalle
                      )

                      return
                    }

                    if (
                      productoSeleccionado.tiene_talle &&
                      variantes.length > 0 &&
                      coloresDisponibles.length >
                        0 &&
                      !colorSeleccionado
                    ) {
                      alert(
                        TEXTOS.seleccionarColor
                      )

                      return
                    }

                    const varianteSeleccionada =
                      obtenerVarianteSeleccionada()

                    const precioSeleccionado =
                      varianteSeleccionada
                        ? calcularPrecioFinal(varianteSeleccionada.precio, productoSeleccionado)
                        : obtenerPrecioActual()

                    // La imagen que se guarda en el carrito
                    // es la que está mostrando actualmente.
                    const imagenCarrito =
                      imagenesProducto[
                        fotoActual
                      ] ||
                      imagenesPortada[
                        productoSeleccionado.id
                      ] ||
                      productoSeleccionado.image ||
                      ''

                    const productoParaCarrito: ItemCarrito = {
                      ...productoSeleccionado,

                      talle:
                        talleSeleccionado ||
                        null,

                      color:
                        colorSeleccionado ||
                        null,

                      image:
                        imagenCarrito,

                      price:
                        precioSeleccionado,

                      variante_id:
                        varianteSeleccionada?.id ||
                        null,

                      cantidad:
                        1
                    }

                    for (let i = 0; i < cantidadProducto; i += 1) {
                      agregarAlCarrito(productoParaCarrito)
                    }

                    setCantidadProducto(1)
                    cerrarProducto()
                  }}
                >
                  {stockDisponible(
                    productoSeleccionado
                  ) > 0
                    ? TEXTOS.agregarCarrito
                    : TEXTOS.sinStock}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
<a
  href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(
    `${TIENDA_CONFIG.marca.nombre} 👋 Quiero hacer una consulta.`
  )}`}
  target="_blank"
  rel="noreferrer"
  aria-label="Contactar por WhatsApp"
  style={{
    position: 'fixed',
    right: '18px',
    bottom: '18px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#25D366',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
    textDecoration: 'none',
  }}
>
  <svg
    viewBox="0 0 32 32"
    width="30"
    height="30"
    fill="white"
    aria-hidden="true"
  >
    <path d="M19.11 17.42c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.64-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.5 1.69.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
    <path d="M16 3C8.82 3 3 8.82 3 16c0 2.29.6 4.53 1.74 6.51L3 29l6.67-1.7A12.94 12.94 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 23.6c-2.02 0-4-.54-5.73-1.56l-.41-.24-3.96 1.01 1.06-3.86-.27-.42A10.57 10.57 0 1 1 16 26.6z" />
  </svg>
</a>

<Footer />
      <Footer />
    </div>
  )
}

export default App