# AI CVScore

AI CVScore es una aplicación de escritorio avanzada diseñada para transformar currículums escritos en formato Markdown (con metadatos en YAML) en documentos PDF de alta fidelidad profesional. Esta evolución integra un **Optimizador de IA basado en OpenAI** para adaptar automáticamente tu perfil a ofertas de trabajo específicas, garantizando una alta compatibilidad con sistemas ATS.

---

## 🚀 Características Principales

- **Optimización con IA (OpenAI):**  
  Generación automática de CVs adaptados a ofertas de empleo utilizando GPT-4 y técnicas de Few-Shot Prompting para mantener la estructura y el tono profesional.

- **Interfaz de Dos Fases (Wizard):**
  1. **Paso 1 (Configuración e IA):** Entrada de la oferta de trabajo, gestión de información personal base e instrucciones específicas para la IA.
  2. **Paso 2 (Edición y Exportación):** Editor de Markdown con previsualización en tiempo real y exportación profesional a PDF.

- **Gestión de Datos Base:**  
  Separación entre tus datos maestros (`info.md`) y las versiones generadas para ofertas específicas.

- **Motor de Renderizado Profesional:**  
  Uso de Playwright (Chromium) para generar archivos PDF en formato A4 con soporte completo para estilos CSS complejos.

- **Arquitectura Desacoplada:**  
  Prompts y ejemplos de IA gestionados externamente en archivos Markdown para facilitar el ajuste del modelo sin tocar el código fuente.

---

## 🛠️ Stack Tecnológico

- **Runtime:** Node.js (v18+) & Electron  
- **Lenguaje:** TypeScript (tipado estricto)  
- **IA:** OpenAI API (GPT-4 Turbo)  
- **Procesamiento de Texto:** Remark, Gray-matter & Handlebars  
- **Generación de PDF:** Playwright  
- **Validación de Datos:** Zod  

---

## 📂 Estructura del Proyecto

```plaintext
Plaintext
├── assets/               # Recursos estáticos (imágenes de perfil, logos)
├── bin/                  # Binarios de Playwright (autocontenidos)
├── data/                 # Almacenamiento local (info.md, cv.md)
├── few-shots/            # Ejemplos de entrenamiento para la IA (user/assistant)
├── prompts/              # System Prompts para la lógica de generación
├── src/
│   ├── core/             # Lógica de negocio (Parser, Logger)
│   ├── infra/            # Adaptadores de infra (Motor PDF, AiService)
│   ├── renderer/         # Interfaz de usuario (HTML/JS de Electron)
│   ├── types/            # Definiciones de tipos y esquemas Zod
│   ├── main.ts           # Proceso principal de Electron
│   └── preload.cts       # Puente de comunicación seguro (IPC)
├── templates/            # Plantillas Handlebars (Classic, Modern)
├── .env                  # Configuración de API Keys (No incluido en repo)
└── package.json          # Configuración y dependencias
```

## 📂 Estructura Crítica de Archivos

Para el correcto funcionamiento de la IA y el renderizado, se debe respetar la siguiente estructura:

### 1. Prompts y Ejemplos (Few-Shots)

La aplicación busca nombres de archivos específicos en el proceso principal:

- `prompts/generation-system.md`: El System Prompt principal
- `few-shots/`: Debe contener exactamente:
  - `01-user.md`, `01-assistant.md`
  - `02-user.md`, `02-assistant.md`
  - `03-user.md`, `03-assistant.md`

### 2. Activos Visuales

- `assets/profile.png`: Tu fotografía de perfil (soporta .jpg y .webp) que se inyectará automáticamente en las plantillas

---

## ⚙️ Instalación y Configuración Crítica

### 1. Requisitos Previos

- Node.js v18.0.0 o superior
- Una API Key válida de OpenAI

### 2. Instalación de dependencias

```bash
npm install
npm run install-runtime
```

### 3. Configuración de API (OpenAI)

Crea un archivo llamado `.env` en la raíz del proyecto con tu clave de API:

```plaintext
OPENAI_API_KEY=tu_clave_aqui
```

**Nota**: En la versión instalada (producción), este archivo debe copiarse manualmente a la carpeta `/resources/.env` si no se incluyó en el empaquetado.

### 4. Creación de Información Base

La IA necesita tus datos maestros para trabajar. Crea el archivo `data/info.md` siguiendo esta estructura sugerida:

```markdown
# Mi Perfil Profesional

- **Nombre:** Tu Nombre
- **Experiencia:** Detalla aquí toda tu trayectoria...
- **Stack:** Lista de tecnologías y habilidades...
- **Educación:** Títulos y certificaciones...
```

---

## 🛠️ Scripts de Desarrollo

- `npm run electron:dev` – Compila TypeScript y lanza la aplicación en modo desarrollo.  
- `npm run build` – Compila el proyecto (tsc).  
- `npm run dist` – Empaqueta la aplicación para distribución (Windows/NSIS).  

---

## 📝 Flujo de Trabajo

1. **Paso 1:** Pega la descripción de la oferta de trabajo y revisa que tu `info.md` esté actualizado. Añade especificaciones adicionales si quieres que la IA destaque algo concreto.  
2. **Generación:** Pulsa "Generar con IA". El sistema enviará el prompt configurado junto con los ejemplos de la carpeta `few-shots` para obtener el mejor resultado.  
3. **Paso 2:** Revisa el Markdown generado. Puedes cargar CVs previos o guardar la versión actual.  
4. **Exportación:** Selecciona tu plantilla preferida y exporta a PDF. El sistema creará una carpeta con marca de tiempo para mantener tus versiones organizadas.  

---

**Autor:** Pablo Gómez Ramírez  

**Licencia:** MIT

