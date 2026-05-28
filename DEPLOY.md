# Publicar en GitHub Pages (solo HTML, CSS y JS)

En producción **no hace falta Node ni ningún servidor**. GitHub Pages sirve archivos estáticos; el dashboard arranca leyendo los datos **ya incluidos dentro del JavaScript** (no descarga el Excel al abrir).

## URL correcta

**https://sistemastsjavier.github.io/TACTICAL-SUPPORT-SERVICIO_DANFOSS/**

## Qué se publica

Tras `npm run build:pages`, la carpeta `docs/` (o `dist/` en Actions) contiene solo:

- `index.html`
- `assets/*.js` y `assets/*.css`
- imágenes (`*.png`, `*.svg`)
- `404.html` (misma app, para rutas del router)

No se usa `/src/main.tsx` en producción.

## Actualizar datos del Excel

1. Coloca `Evaluacion Danfoss.xlsx` en `data/original/`.
2. Ejecuta: `npm run import:data` (genera `src/data/evaluacion.json`).
3. Ejecuta: `npm run build:pages` y sube `docs/` a GitHub.

## Configuración en GitHub

**Settings → Pages → Build and deployment**

| Opción | Configuración |
|--------|----------------|
| **A (recomendada)** | Source: **GitHub Actions** |
| **B** | Deploy from branch → `main` → carpeta **`/docs`** |

**No** uses “Deploy from branch → `/ (root)`”.

## Desarrollo en tu PC

```bash
npm run dev
```

Ahí sí se puede cargar el Excel desde `public/` (modo desarrollo). En el build de Pages, `VITE_STATIC_ONLY=true` empaqueta los datos en el JS.

## Comprobar el build estático

```bash
npm run build:pages
npx vite preview
```

Abre la URL que indique `vite preview` y recarga con **Ctrl+F5**.
