# Plantilla limpia de tienda online

Esta carpeta es una base reutilizable para crear una tienda nueva con **React + TypeScript + Vite + Supabase**.

No contiene datos, credenciales ni branding de una tienda concreta.

## 📁 Dónde editar cada cosa

### 1. Marca, logo, colores y contacto
**`src/config/tienda.ts`**

Es el archivo principal para personalizar una nueva tienda:
- nombre
- logo
- favicon
- slogan
- colores
- WhatsApp
- Instagram
- Facebook
- email
- moneda
- textos generales

### 2. Logo e imágenes de la marca
**`public/marca/`**

Reemplazá `logo.svg` por el logo de la nueva tienda si querés. La aplicación toma el logo desde esta carpeta.

### 3. Diseño general
- **`src/App.css`** → estilos de la tienda y componentes principales.
- **`src/index.css`** → estilos globales.

### 4. Página y funcionamiento
- **`src/App.tsx`** → catálogo, búsqueda, carrito, detalle de producto, checkout y estadísticas.
- **`src/pages/Admin.tsx`** → panel administrador.

### 5. Componentes
**`src/components/`**
- `header.tsx` → encabezado.
- `navbar.tsx` → navegación.
- `ProuctoCard.tsx` → tarjeta de producto.
- `footer.tsx` → pie de página.

### 6. Supabase
**`src/lib/supabase.ts`** conecta la aplicación con Supabase.

Copiá `.env.example` como `.env` y completá:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU-PUBLISHABLE-KEY
```

**No compartas el `.env` ni lo subas a Git.**

### 7. Base de datos
`migracion_supabase.sql` contiene la migración adicional que usa esta versión para descuentos y categorías/subcategorías.

> Esta migración supone que ya existe la estructura base de la tienda (Productos, pedidos, etc.).

## 🚀 Para empezar una tienda nueva

1. Copiá esta carpeta.
2. Cambiá `src/config/tienda.ts`.
3. Reemplazá los archivos de `public/marca/`.
4. Creá el `.env` a partir de `.env.example` con el nuevo proyecto Supabase.
5. Ejecutá:

```bash
npm install
npm run dev
```

Para comprobar que compila:

```bash
npm run build
```

## ⚠️ Importante

La carpeta entregada **no incluye `node_modules` ni `dist`**, porque no hace falta guardarlos dentro de una plantilla y ocupan muchísimo espacio. Se generan nuevamente con `npm install` y `npm run build`.
