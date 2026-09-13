/**
 * CONFIGURACIÓN GENERAL DE LA TIENDA
 *
 * Para una nueva marca, normalmente alcanza con cambiar este archivo.
 */
export const TIENDA_CONFIG = {
marca: {
  nombre: 'Milkiss',
 logo: '/marca/logo-milkiss.png',
  favicon: '/marca/favicon.png',
  slogan: 'Peluches y regalería',
},
  colores: {
    principal: '#222222',
    secundario: '#444444',
    secundarioClaro: '#666666',
    fondo: '#ffffff',
    texto: '#222222',
    textoClaro: '#666666',
  },
  contacto: {
    whatsappNumero: '+542664909335',
    whatsappTexto: 'Hola! Quiero hacer una consulta.',
    instagram: '',
    facebook: '',
    email: '',
  },
  tienda: {
    moneda: '$',
  },
  textos: {
    bienvenida: 'Bienvenido/a a tu tienda',
    sinProductos: 'No hay productos disponibles.',
  },
  estadisticas: {
    sessionStorageKey: 'tienda_session_id',
  },
} as const
