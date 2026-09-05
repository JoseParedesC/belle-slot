# DAHOOD24 — Paleta de colores para Web

## Identidad visual

DAHOOD24 utiliza una identidad **urbana, sobria y premium**, basada principalmente en negro, gris y blanco. Para ampliar la paleta en aplicaciones web, se incorporan tonos intermedios y dos colores de acento controlados.

---

## 🎨 Paleta principal

| Uso | Nombre | HEX |
|---|---|---|
| Negro principal | Obsidian | `#0A0A0A` |
| Negro secundario | Carbon | `#141414` |
| Fondo oscuro | Charcoal | `#1C1C1C` |
| Gris oscuro | Graphite | `#292929` |
| Gris medio | Concrete | `#444444` |
| Gris | Steel | `#666666` |
| Gris claro | Ash | `#999999` |
| Gris muy claro | Silver | `#C7C7C7` |
| Blanco roto | Off White | `#E8E8E8` |
| Blanco | Pure White | `#FFFFFF` |

### Acentos

| Uso | Nombre | HEX |
|---|---|---|
| Acento principal | Acid Lime | `#B6FF00` |
| Acento secundario | Blood Red | `#8F1010` |

---

## 🔥 Uso de los colores de acento

### Acid Lime — `#B6FF00`

Usarlo de manera controlada para:

- Botones principales
- Estados `hover`
- Precios u ofertas destacadas
- Indicadores
- Etiquetas como `NEW`
- Pequeños detalles gráficos
- Líneas o elementos decorativos

El lime debe funcionar como un elemento distintivo de DAHOOD24, no como un color dominante.

### Blood Red — `#8F1010`

Usarlo principalmente para:

- Descuentos
- Stock bajo
- Mensajes de alerta
- Estados de error
- Promociones especiales

---

## 🖥️ Recomendación de distribución

La experiencia visual debería estar compuesta aproximadamente por:

- **90–95 %:** negro, blanco y grises
- **5–10 %:** colores de acento

La identidad principal debe seguir siendo:

> **Negro + Gris + Blanco**

El `#B6FF00` debe utilizarse estratégicamente para dirigir la atención del usuario.

---

## 💻 Variables CSS

```css
:root {
  --black: #0A0A0A;
  --carbon: #141414;
  --charcoal: #1C1C1C;
  --graphite: #292929;

  --gray-dark: #444444;
  --gray: #666666;
  --gray-light: #999999;
  --silver: #C7C7C7;

  --off-white: #E8E8E8;
  --white: #FFFFFF;

  --accent: #B6FF00;
  --danger: #8F1010;
}
```

---

## 🌑 Aplicación recomendada — Dark Mode

### Background

```text
Principal:       #0A0A0A
Secciones:       #141414
Cards:           #1C1C1C
Elementos:       #292929
```

### Texto

```text
Principal:       #FFFFFF
Secundario:      #E8E8E8
Terciario:       #999999
Deshabilitado:   #666666
```

### Bordes

```text
Normal:          #292929
Hover:           #444444
Destacado:       #B6FF00
```

### Acciones

```text
Botón principal: #FFFFFF
Hover:           #B6FF00
Error:           #8F1010
```

---

## 👕 Ejemplo de aplicación de marca

Una sección de lanzamiento podría utilizar:

```text
DAHOOD24
STREETWEAR / URBAN CULTURE

NEW DROP

[ SHOP NOW ]
```

La mayor parte del diseño permanece en negro, blanco y gris. El `#B6FF00` puede utilizarse para destacar `NEW DROP`, un borde, una línea gráfica o el estado `hover` de `SHOP NOW`.

---

## 🎯 Principio de diseño

La regla principal para DAHOOD24:

> **El color debe complementar la ropa, no competir con ella.**

Los productos deben ser los protagonistas. La interfaz debe crear un entorno oscuro, limpio y urbano que permita que las fotografías de las prendas destaquen.

### Jerarquía recomendada

1. **Negro / blanco** → identidad y estructura
2. **Grises** → profundidad y jerarquía
3. **Acid Lime** → atención y personalidad
4. **Blood Red** → alertas y situaciones especiales

---

## 📋 Resumen de colores

```text
OBS​IDIAN     #0A0A0A
CARBON       #141414
CHARCOAL     #1C1C1C
GRAPHITE     #292929
CONCRETE     #444444
STEEL        #666666
ASH          #999999
SILVER       #C7C7C7
OFF WHITE    #E8E8E8
WHITE        #FFFFFF

ACID LIME    #B6FF00
BLOOD RED    #8F1010
```

---

## 🚀 Próximo paso recomendado

Para una implementación completa de DAHOOD24, esta paleta puede ampliarse posteriormente a un sistema de diseño con:

- Design tokens
- Colores para estados `success`, `warning`, `error` e `info`
- Escala de grises completa
- Variables para Tailwind CSS
- Tipografía de marca
- Espaciado
- Bordes y radios
- Sombras
- Botones
- Cards de productos
- Badges
- Navbar
- Footer
- Componentes para e-commerce
