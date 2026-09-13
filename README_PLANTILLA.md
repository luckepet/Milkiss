# Guía rápida para crear una página nueva

## Lo primero que tenés que tocar

Abrí:

`src/config/tienda.ts`

Ahí está concentrada la configuración de la nueva marca.

## Después

1. Poné el logo en `public/marca/`.
2. Configurá el `.env` con el Supabase de la nueva tienda.
3. Si necesitás modificar el encabezado, editá `src/components/header.tsx`.
4. Si necesitás modificar las tarjetas de productos, editá `src/components/ProuctoCard.tsx`.
5. Si necesitás modificar el pie, editá `src/components/footer.tsx`.
6. Para cambios grandes de la tienda, trabajá sobre `src/App.tsx` y `src/App.css`.
7. Para el administrador, trabajá sobre `src/pages/Admin.tsx`.

## Estructura simple

```text
public/
└── marca/              ← logo y archivos de la nueva marca

src/
├── components/         ← partes reutilizables
├── config/
│   └── tienda.ts       ← ⭐ configuración principal
├── lib/
│   └── supabase.ts     ← conexión con Supabase
├── pages/
│   └── Admin.tsx       ← administrador
├── App.tsx             ← lógica principal
├── App.css             ← estilos principales
└── index.css           ← estilos globales

.env.example            ← ejemplo de variables
migracion_supabase.sql  ← migración adicional de BD
```
