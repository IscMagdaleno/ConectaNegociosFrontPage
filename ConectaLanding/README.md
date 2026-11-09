# ConectaLanding

Tercer proyecto de la plataforma Conecta, junto a `ConectaControl/` y `ConectaNegocios/`.
Es la **landing estática de gancho** «Tu puerta a la tecnología» (módulo **CN-01**, visión 6.11).

- HTML, CSS y JavaScript puros. **Sin build, sin npm, sin framework.**
- GSAP y ScrollTrigger van incluidos en `assets/vendor/` (no dependen de una CDN).
- Las fuentes (Montserrat e Inter) se cargan de Google Fonts, igual que en Conecta Negocios.

> Es un **prototipo**: el diseño y el movimiento ya funcionan, pero las imágenes, los precios, los testimonios y el envío del formulario son de ejemplo. Ver «Pendiente antes de publicar».

## Cómo verla

Abre `index.html` directamente, o mejor con un servidor local:

```powershell
cd ConectaLanding
python -m http.server 5600
# luego abre http://127.0.0.1:5600
```

## Estructura

```
ConectaLanding/
├── index.html                 Toda la página (secciones comentadas)
├── css/styles.css             Tokens de diseño + estilos + responsive
├── js/main.js                 Animaciones e interacciones
├── assets/
│   ├── img/                   Imágenes vacías (SVG) con su nota + favicon
│   └── vendor/                gsap.min.js y ScrollTrigger.min.js
└── tools/
    └── generar-placeholders.mjs   Regenera las imágenes vacías (node)
```

## Identidad

Los colores y las tipografías salen del sistema de diseño de Conecta Negocios
(`ConectaNegocios.Client/wwwroot/css/cn-styles.css`):

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-900` / `--bg-800` | `#070b1e` / `#0b1026` | Fondo |
| `--indigo` / `--purple` | `#1a1040` / `#2a1a5e` | Degradados morados |
| `--accent` | `#22d3ee` (cian) | Acento principal, enlaces, número de tarjeta |
| `--accent-2` | `#34d399` (menta) | Palomitas, estados correctos |
| `--accent-3` | `#7c5cff` (violeta) | Segundo color del degradado de marca |
| `--text` / `--text-muted` | `#e8ecf6` / `#a7b0c9` | Texto |
| Títulos / texto | Montserrat / Inter | Igual que `cn-styles.css` |

Las secciones claras (pago por uso y preguntas) usan `#e8ecf6` como fondo para romper el azul oscuro.

## Efectos (inspirados en la plantilla «Davies»)

La estructura, el contenido y el código son propios; solo se tomó la idea de cada efecto.

| Efecto | Dónde | Cómo |
|--------|-------|------|
| Preloader con barras y cortina que sube | Al abrir | GSAP + `clip-path` animado con una variable CSS |
| Titular que sube desde una máscara | Hero | GSAP, `yPercent` |
| Texto que se ilumina letra por letra | «Cómo funciona» | Se parte el texto en letras y `ScrollTrigger` con `scrub` |
| Tarjetas apiladas que se encogen y oscurecen | «Lo que logra tu negocio» | `position: sticky` + `ScrollTrigger` (`scale` y `brightness`) |
| Abanico de pantallas en 3D | Conecta Control | GSAP timeline con rotación X/Y |
| Marquesina infinita | Bajo el hero | CSS `@keyframes` (se pausa al pasar el cursor) |
| Botones con relleno que sube | Todos | CSS (`::before` desplazado) |
| Menú que desenfoca los demás enlaces | Barra y menú móvil | CSS (`:hover` + `filter: blur`) |
| Estela del cursor y ondas al hacer clic | Toda la página | `canvas` (solo con mouse) |
| Partículas que reaccionan al cursor | Fondo | `canvas`; mismo efecto que el fondo de Conecta Negocios |
| Contadores | «Pagas lo que usas» | GSAP al entrar en pantalla |
| Anillo de progreso en «volver arriba» | Esquina inferior derecha | CSS `conic-gradient` |
| Acordeón, pestañas y carrusel | Preguntas, Control, planes, testimonios | JS sin librerías |

**Accesibilidad y rendimiento**
- Con `prefers-reduced-motion` se omiten preloader, partículas, estela y animaciones de scroll.
- Si GSAP no carga, la página sigue siendo legible.
- En móvil (< 768 px) las tarjetas no se apilan y el abanico se reduce.
- El texto que se ilumina conserva el texto original en `aria-label`.

## Imágenes pendientes

Cada imagen es hoy un SVG vacío (`assets/img/*.svg`) que muestra, dentro de sí mismo, su nota de qué poner.
Para usar una foto real: guarda el archivo en `assets/img/` y cambia el `src` en `index.html`
(cada imagen tiene un comentario `<!-- IMAGEN: nombre -->` encima).

| Archivo | Tamaño | Qué estaría bien poner |
|---------|--------|------------------------|
| `hero-fondo` | 1920×1080 | Foto de ambiente: dueña o dueño de un negocio local atendiendo con el celular en la mano. Luz cálida y zonas oscuras a la izquierda, para que el texto blanco se lea. |
| `trabajo-presencia` | 1400×640 | Captura del perfil público de un negocio en Conecta Negocios, dentro de un celular: logo, horarios, ubicación y botón de WhatsApp. |
| `trabajo-catalogo` | 1400×640 | Captura del catálogo en cuadrícula: fotos, precios y botón de contactar. Celular y laptop a la vez. |
| `trabajo-publicaciones` | 1400×640 | Publicación de oferta con imagen mejorada con IA, junto a la original (antes y después), con reacciones y comentarios. |
| `trabajo-clientes` | 1400×640 | Chat directo cliente–negocio, o el módulo «Se busca». |
| `about-negocio` | 900×1100 | Foto vertical: comerciante real en su local mostrando su perfil de Conecta en el celular. Luz natural. |
| `control-pos` | 1500×940 | Captura del Punto de Venta de Control en pantalla completa: lista a la izquierda, ticket y botón verde COBRAR a la derecha. |
| `pantalla-pos` | 650×650 | Recorte cuadrado de la caja con un ticket abierto y el total en verde. |
| `pantalla-inventario` | 650×650 | Recorte cuadrado de productos con existencias y alertas de stock bajo. |
| `pantalla-clientes` | 650×650 | Recorte cuadrado de la ficha de un cliente: saldo, abonos y apartados. |
| `pantalla-corte` | 650×650 | Recorte cuadrado del corte de caja: efectivo esperado contra contado. |
| `pantalla-finanzas` | 650×650 | Recorte cuadrado del resumen del mes: ventas, compras, gastos y resultado. |
| `pantalla-asistente` | 650×650 | Recorte cuadrado del asistente respondiendo «cómo hago X» con botón para abrir el módulo. |
| `testimonio-1` a `testimonio-3` | 240×240 | Rostro cuadrado de la persona que da el testimonio. |
| `cta-fondo` | 1920×900 | Fachada o mostrador de un negocio local al atardecer, poco detallada (va muy oscurecida detrás del formulario). |
| `og-imagen` | 1200×630 | Logo con el slogan sobre el fondo azul y morado. **Exportar como PNG o JPG**: las redes no leen SVG. |

Las capturas de Control y Negocios se pueden sacar de las propias apps con datos de ejemplo.

Para cambiar una nota o un tamaño: edita la lista `IMAGENES` en `tools/generar-placeholders.mjs` y corre `node tools/generar-placeholders.mjs`.
(Eso **sobrescribe** `assets/img/*.svg`: no lo corras después de poner fotos con el mismo nombre.)

## Pendiente antes de publicar

| # | Pendiente | Dónde |
|---|-----------|-------|
| 1 | Reemplazar las imágenes vacías por fotos y capturas reales | `assets/img/`, tabla de arriba |
| 2 | **Precios**: hoy dicen `$000`. Salen del catálogo de tarifas (visión 9.5); no se fijan en esta página | `index.html`, sección `#planes` (`data-m` / `data-a`) |
| 3 | **Testimonios**: son de ejemplo y están marcados «Ejemplo». Reemplazar por reales | `index.html`, sección `#testimonios` |
| 4 | **Formulario**: hoy solo muestra «Gracias» y no envía nada. Falta el endpoint (correo o API) | `js/main.js`, función `formulario()` (marca `TODO`) |
| 5 | Correo de contacto real (hoy `hola@tu-dominio.com`) | `index.html`, sección `#contacto` |
| 6 | Aviso de privacidad, condiciones y redes (los enlaces son `#`) | `index.html`, pie |
| 7 | Dominio público (decisión 13 de la visión) y etiquetas `og:image` con un PNG/JPG | `index.html`, `<head>` |
| 8 | Confirmar que los textos de «Conecta Control» y «30+ módulos» siguen vigentes al publicar | `index.html` |
| 9 | Revisar la licencia vigente de GSAP si se publica con fines comerciales | `assets/vendor/` |
| 10 | Hospedaje: al ser estático sirve cualquier hosting (Azure Static Web Apps, Blob con CDN, etc.) | — |

## Contenido

Todo el texto sale de la visión general (sección 6.11 y 6.0):
slogan, qué explicar, los tres planes (**Esencial**, **Conecta** recomendado al centro, **Pro**),
Conecta Control «por separado o conectado» y el bloque Contáctanos.
Los precios y las cuotas **no** se fijan aquí.
