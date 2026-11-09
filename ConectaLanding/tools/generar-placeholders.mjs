// Genera las imágenes vacías (SVG) de la landing, cada una con la nota de qué conviene poner.
// Uso:  node tools/generar-placeholders.mjs
// Para cambiar una nota, edita la lista `IMAGENES` y vuelve a correr el script.
// Para usar una foto real: guarda el archivo en assets/img/ y cambia el `src` en index.html.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const salida = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'img');
mkdirSync(salida, { recursive: true });

const IMAGENES = [
  {
    archivo: 'hero-fondo', w: 1920, h: 1080, uso: 'Fondo de la portada (hero)', pos: 'arriba',
    nota: 'Foto de ambiente: dueña o dueño de un negocio local (tienda, cafetería, papelería) atendiendo con el celular en la mano. Luz cálida y zonas oscuras a la izquierda, para que el texto blanco se lea bien.'
  },
  {
    archivo: 'trabajo-presencia', w: 1400, h: 640, uso: 'Tarjeta 01 · Presencia',
    nota: 'Captura del perfil público de un negocio en Conecta Negocios, dentro de un celular: logo, horarios, ubicación y botón de WhatsApp. Idealmente con un negocio real o de ejemplo creíble.'
  },
  {
    archivo: 'trabajo-catalogo', w: 1400, h: 640, uso: 'Tarjeta 02 · Catálogo',
    nota: 'Captura del catálogo en cuadrícula: fotos de producto, precios y el botón de contactar al negocio. Puede mostrarse en celular y en laptop a la vez.'
  },
  {
    archivo: 'trabajo-publicaciones', w: 1400, h: 640, uso: 'Tarjeta 03 · Publicaciones e IA',
    nota: 'Captura de una publicación de oferta con imagen mejorada con IA, junto a la imagen original (antes y después), con reacciones y comentarios visibles.'
  },
  {
    archivo: 'trabajo-clientes', w: 1400, h: 640, uso: 'Tarjeta 04 · Clientes',
    nota: 'Captura del chat directo entre cliente y negocio o del módulo «Se busca» (alguien pide un producto y varios negocios responden).'
  },
  {
    archivo: 'about-negocio', w: 900, h: 1100, uso: 'Sección «Cómo funciona»',
    nota: 'Foto vertical: comerciante real en su local mostrando su perfil de Conecta en el celular. Sonriendo, luz natural, fondo del negocio visible (anaqueles, mostrador).'
  },
  {
    archivo: 'control-pos', w: 1500, h: 940, uso: 'Sección Conecta Control (imagen grande)',
    nota: 'Captura del Punto de Venta de Conecta Control en pantalla completa: dos columnas, lista de productos a la izquierda, ticket y botón verde COBRAR a la derecha. Mejor con datos de ejemplo de una miscelánea.'
  },
  {
    archivo: 'pantalla-pos', w: 650, h: 650, uso: 'Abanico · Punto de venta',
    nota: 'Recorte cuadrado de la caja (POS) con un ticket abierto y el total en verde.'
  },
  {
    archivo: 'pantalla-inventario', w: 650, h: 650, uso: 'Abanico · Inventario',
    nota: 'Recorte cuadrado de la lista de productos con existencias y alertas de stock bajo.'
  },
  {
    archivo: 'pantalla-clientes', w: 650, h: 650, uso: 'Abanico · Clientes y crédito',
    nota: 'Recorte cuadrado de la ficha de un cliente con su saldo, abonos y apartados.'
  },
  {
    archivo: 'pantalla-corte', w: 650, h: 650, uso: 'Abanico · Corte de caja',
    nota: 'Recorte cuadrado del corte de caja del día: efectivo esperado contra contado.'
  },
  {
    archivo: 'pantalla-finanzas', w: 650, h: 650, uso: 'Abanico · Finanzas',
    nota: 'Recorte cuadrado del resumen del mes: ventas, compras, gastos y resultado.'
  },
  {
    archivo: 'pantalla-asistente', w: 650, h: 650, uso: 'Abanico · Asistente IA',
    nota: 'Recorte cuadrado del asistente respondiendo «cómo hago X» con un botón para abrir el módulo.'
  },
  {
    archivo: 'testimonio-1', w: 240, h: 240, uso: 'Avatar testimonio 1',
    nota: 'Rostro cuadrado de la persona que da el testimonio.'
  },
  {
    archivo: 'testimonio-2', w: 240, h: 240, uso: 'Avatar testimonio 2',
    nota: 'Rostro cuadrado de la persona que da el testimonio.'
  },
  {
    archivo: 'testimonio-3', w: 240, h: 240, uso: 'Avatar testimonio 3',
    nota: 'Rostro cuadrado de la persona que da el testimonio.'
  },
  {
    archivo: 'cta-fondo', w: 1920, h: 900, uso: 'Fondo de la sección de contacto',
    nota: 'Fachada o mostrador de un negocio local al atardecer, con luces cálidas. Mejor si es poco detallada: va muy oscurecida detrás del formulario.'
  },
  {
    archivo: 'og-imagen', w: 1200, h: 630, uso: 'Imagen para compartir en redes (Open Graph)',
    nota: 'Logo de Conecta con el slogan «Tu puerta a la tecnología» sobre el fondo azul y morado. Exportar como PNG o JPG de 1200×630 y apuntar la etiqueta og:image a ese archivo.'
  }
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function envolver(texto, max) {
  const lineas = [];
  let actual = '';
  for (const palabra of texto.split(' ')) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (prueba.length > max && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

function construir({ archivo, w, h, uso, nota, pos }) {
  const chico = w < 400;
  const arriba = pos === 'arriba'; // el texto va en la parte alta (no tapa el titular del hero)
  const base = Math.min(w, h * 1.4);
  const fs = arriba ? 22 : Math.max(chico ? 13 : 15, Math.min(36, Math.round(base / 34)));
  const maxChars = Math.max(14, Math.floor((w * (arriba ? 0.5 : chico ? 0.8 : 0.66)) / (fs * 0.56)));
  const lineasNota = envolver(nota, maxChars);
  const interlinea = Math.round(fs * 1.45);

  const iconoTam = chico ? 34 : arriba ? 52 : Math.round(Math.min(w, h) * 0.09);
  const bloqueAlto =
    iconoTam + 18 +
    (chico ? 0 : fs + 8 + Math.round(fs * 0.85) + 18) +
    lineasNota.length * interlinea;
  let y = arriba ? Math.round(h * 0.08) : Math.round((h - bloqueAlto) / 2);
  const cx = w / 2;
  const partes = [];

  // Icono de imagen (montaña + sol)
  const k = iconoTam / 24;
  partes.push(
    `<g transform="translate(${cx - iconoTam / 2} ${y}) scale(${k})" fill="none" stroke="#22d3ee" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">` +
      `<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.6"/><path d="m21 15-5-5L5 21"/></g>`
  );
  y += iconoTam + 18;

  if (!chico) {
    y += fs;
    partes.push(
      `<text x="${cx}" y="${y}" text-anchor="middle" font-size="${fs}" font-weight="700" letter-spacing="3" fill="#ffffff">IMAGEN PENDIENTE</text>`
    );
    y += 8 + Math.round(fs * 0.85);
    partes.push(
      `<text x="${cx}" y="${y}" text-anchor="middle" font-size="${Math.round(fs * 0.85)}" fill="#7c5cff">${esc(uso)} · ${archivo}.svg · ${w}×${h}</text>`
    );
    y += 18;
  }

  for (const linea of lineasNota) {
    y += interlinea;
    partes.push(
      `<text x="${cx}" y="${y}" text-anchor="middle" font-size="${fs}" fill="#a7b0c9">${esc(linea)}</text>`
    );
  }

  const inset = Math.max(10, Math.round(Math.min(w, h) * 0.025));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(uso)}: ${esc(nota)}">
<title>${esc(uso)}</title>
<desc>${esc(nota)}</desc>
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14163a"/><stop offset="0.55" stop-color="#1a1040"/><stop offset="1" stop-color="#0b1026"/></linearGradient>
<radialGradient id="r1" cx="0.15" cy="0" r="0.8"><stop offset="0" stop-color="#7c5cff" stop-opacity="0.35"/><stop offset="1" stop-color="#7c5cff" stop-opacity="0"/></radialGradient>
<radialGradient id="r2" cx="1" cy="0" r="0.7"><stop offset="0" stop-color="#22d3ee" stop-opacity="0.22"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<rect width="${w}" height="${h}" fill="url(#r1)"/>
<rect width="${w}" height="${h}" fill="url(#r2)"/>
<rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" rx="${Math.round(inset * 1.2)}" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2" stroke-dasharray="14 10"/>
<g font-family="'Segoe UI', Roboto, Arial, sans-serif">
${partes.join('\n')}
</g>
</svg>
`;
}

for (const img of IMAGENES) {
  writeFileSync(join(salida, `${img.archivo}.svg`), construir(img), 'utf8');
}

// Favicon (este sí es real: es la marca, no una imagen pendiente)
writeFileSync(
  join(salida, 'favicon.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#7c5cff"/></linearGradient></defs>
<rect width="64" height="64" rx="16" fill="#0b1026"/>
<path d="M40 22a14 14 0 1 0 0 20" fill="none" stroke="url(#g)" stroke-width="7" stroke-linecap="round"/>
<rect x="38" y="46" width="14" height="5" rx="2.5" fill="url(#g)"/>
</svg>
`,
  'utf8'
);

console.log(`Listo: ${IMAGENES.length} imágenes vacías + favicon en ${salida}`);
