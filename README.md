# Fast Ebook Reader PWA 📚⚡

Una aplicación web progresiva (PWA) "Local-First" diseñada para la lectura de alta velocidad de libros EPUB utilizando la técnica RSVP (Rapid Serial Visual Presentation).

## 🎯 Objetivo del Proyecto
Crear un lector de libros electrónicos moderno que elimine los movimientos sacádicos del ojo. El sistema descompone los capítulos de un EPUB en una secuencia de palabras individuales, mostrándolas una a una a alta velocidad, centradas en su "Punto Óptimo de Reconocimiento" (ORP).

## 🛠 Tech Stack
- **Core:** React 18+ (Hooks), TypeScript, Vite.
- **Parsing de Libros:** `epubjs` (para leer la estructura y extraer texto) y `jszip`.
- **Estado Global:** `Zustand` (Manejo de velocidad WPM, posición actual, tema).
- **Persistencia (Offline):** `Dexie.js` (IndexedDB wrapper) para guardar los archivos .epub completos y el progreso de lectura.
- **Estilos:** CSS Modules / Tailwind (enfocado en layout Flexbox para alineación precisa).
- **PWA:** Vite PWA Plugin (Service Workers para soporte offline total).

## 🧠 Lógica Core: El Renderizado RSVP
Esta es la parte más crítica de la aplicación. No mostramos páginas de texto.
1. **Extracción:** El texto se extrae "limpio" del capítulo actual del EPUB.
2. **Tokenización:** Se divide en un array de palabras.
3. **Cálculo del Pivote (ORP):**
   - Cada palabra tiene una "letra pivote" (letras 1-4 dependiendo de la longitud).
   - **Requisito Visual:** La letra pivote debe estar **siempre en el mismo pixel central** de la pantalla, coloreada en ROJO (u otro color de contraste).
   - **Alineación:** Usamos un layout Flexbox donde:
     - `Izquierda`: Texto previo al pivote (alineado a la derecha).
     - `Centro`: Letra pivote (ancho fijo).
     - `Derecha`: Texto posterior al pivote (alineado a la izquierda).

## 📂 Arquitectura de Datos
- **Base de Datos (IndexedDB):**
  - Tabla `books`: `id` (uuid), `title`, `author`, `cover` (blob), `data` (arrayBuffer del epub).
  - Tabla `progress`: `bookId`, `cfi` (ubicación ePub), `wordIndex` (para el modo RSVP).

## 🚀 Roadmap de Funcionalidades
1. [ ] Drag & Drop de archivo .epub e ingesta en IndexedDB.
2. [ ] Vista de Biblioteca (Grid de portadas).
3. [ ] Motor RSVP: Componente visual con alineación precisa.
4. [ ] Controles de reproducción: Play/Pause, Slider de velocidad (WPM), Barra de progreso.
5. [ ] Configuración: Cambiar tamaño de fuente y temas (Dark/Light).

---
*Este README sirve como contexto para asistentes de IA. Por favor, seguir estrictamente la arquitectura "Local-First" y la lógica de alineación de pivote.*