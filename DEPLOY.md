# Publicar en GitHub Pages

## URL correcta

**https://sistemastsjavier.github.io/TACTICAL-SUPPORT-SERVICIO_DANFOSS/**

No abras `https://sistemastsjavier.github.io/` ni rutas como `/src/main.tsx`: el navegador no puede ejecutar TypeScript sin compilar.

## Configuración en GitHub (una sola opción)

En el repo → **Settings** → **Pages** → **Build and deployment**:

### Opción A (recomendada): GitHub Actions

- **Source:** GitHub Actions  
- Cada push a `main` ejecuta `.github/workflows/deploy.yml` y publica la carpeta `dist` compilada.

### Opción B: Rama `main`, carpeta `/docs`

1. En tu PC: `npm run build:pages` (genera `docs/` con el bundle).
2. Sube los cambios de `docs/` a GitHub.
3. En Pages: **Deploy from a branch** → branch `main` → folder **`/docs`**.

### No uses esto

- **Deploy from branch → `/ (root)`** sirve el `index.html` de desarrollo (`/src/main.tsx`) y verás **404** en producción.

## Comprobar en local

```bash
npm run build:pages
npx vite preview --base /TACTICAL-SUPPORT-SERVICIO_DANFOSS/
```

Abre la URL que indique `vite preview` y recarga con **Ctrl+F5**.
