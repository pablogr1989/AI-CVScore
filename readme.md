# AI CVScore 🚀

**AI CVScore** es una aplicación de escritorio avanzada diseñada para transformar currículums escritos en formato **Markdown** (con metadatos en **YAML**) en documentos **PDF** de alta fidelidad profesional.  
Integra un **Optimizador de IA basado en OpenAI** para adaptar perfiles a ofertas de trabajo específicas y un **motor de validación de compatibilidad ATS**.

---

## ✨ Características Principales

### 🤖 Optimización con IA (OpenAI)
Generación automática de CVs utilizando modelos avanzados (**GPT-4**) y técnicas de **Few-Shot Prompting**, manteniendo estructura, semántica y tono profesional.

### 📊 Módulo de Validación de Score
Análisis intermedio del CV generado frente a la oferta laboral, devolviendo:
- Score de compatibilidad
- Sugerencias automáticas de mejora

### 🧭 Interfaz de Tres Fases (Wizard)

**Paso 1 — Configuración e IA**  
Entrada de oferta laboral, gestión del perfil base e instrucciones de optimización.

**Paso 2 — Validación de Compatibilidad**  
Cálculo de score ATS y refinamiento semántico.

**Paso 3 — Edición y Exportación**  
Editor Markdown con previsualización en tiempo real y exportación profesional a PDF.

### 🌍 Plantillas Multi-idioma
Incluye diseños optimizados:
- Classic (ES)
- Classic (English)
- Modern  

Con jerarquía visual mejorada y fotografía centrada.

### 📁 Gestión Nativa de Archivos
Integración con diálogos del sistema (**Guardar como**), permitiendo versionado flexible de CVs.

---

## 🛠️ Stack Tecnológico

- **Runtime:** Node.js (v18+) & Electron  
- **Lenguaje:** TypeScript (ESM)  
- **IA:** OpenAI API  
- **Procesamiento de Texto:** Remark, Gray-matter, Handlebars  
- **Generación PDF:** Puppeteer (Chromium)  
- **Validación:** Zod  

---

## 📂 Estructura del Proyecto

```plaintext
├── assets/               # Recursos estáticos (iconos y multimedia)
│   └── profile.png       # Fotografía de perfil (DEBE SER AÑADIDA MANUALMENTE)
├── data/                 # Almacenamiento local de datos del usuario
│   └── info.md           # Perfil profesional maestro (GENERADO AL ARRANCAR)
├── few-shots/            # Ejemplos de entrenamiento IA (user/assistant)
├── prompts/              # System Prompts (generación y validación)
├── src/
│   ├── core/             # Lógica de negocio central
│   │   └── interfaces/   # Contratos (IAIService)
│   ├── infra/            # Implementaciones técnicas
│   ├── renderer/         # UI del Wizard
│   ├── types/            # Esquemas Zod y tipos
│   ├── main.ts           # Proceso principal Electron
│   ├── preload.cts       # Context Isolation / IPC
│   └── index.ts          # Entrada por consola
├── templates/            # Plantillas PDF
│   ├── classic/
│   ├── classic-english/
│   └── modern/
├── tests/                # Tests unitarios (Vitest)
├── .env                  # API Keys (NO incluido)
├── package.json
└── tsconfig.json
```

---

## ⚙️ Instalación y Configuración

### 1️⃣ Requisitos Previos
- Node.js v18 o superior
- API Key válida de OpenAI

### 2️⃣ Instalación
```bash
npm install
```

### 3️⃣ Configuración de API
Crea un archivo `.env` en la raíz:

```env
OPENAI_API_KEY=tu_clave_aqui
```

### 4️⃣ Perfil Profesional (`data/info.md`)
Si no existe, se genera automáticamente al iniciar.  
Debes editarlo con tu información real:

```markdown
# Mi Perfil Profesional
- **Nombre:** Tu Nombre
- **Experiencia:** Trayectoria profesional...
- **Stack:** Tecnologías y habilidades...
- **Educación:** Títulos y certificaciones...
```

### 5️⃣ Fotografía de Perfil
Añade tu foto en `assets/profile.png`  
(soporta `.png`, `.jpg`, `.webp`)

---

## 📌 Estructura Crítica Requerida

- `prompts/generation-system.md`
- `prompts/validation-system.md`
- `few-shots/01-user.md → 03-assistant.md`
- `templates/*/layout.hbs`
- `templates/*/styles.css`

---

## 🧪 Scripts Disponibles

```bash
npm run electron:dev   # Desarrollo
npm run build          # Build TypeScript
npm run dist           # Instalador Windows (NSIS)
npm run test           # Tests con Vitest
npm run format         # Prettier
```

---

## 🔄 Flujo de Trabajo

1. **Optimización:** Introduce la oferta → IA genera el CV.
2. **Validación:** Obtén score ATS + feedback.
3. **Personalización:** Ajustes manuales y plantilla.
4. **Exportación:** Markdown + PDF profesional.

---

## 📄 Licencia
Proyecto personal / uso profesional.

---

**AI CVScore** — Optimiza tu CV con IA, valida con lógica real y exporta como un profesional.
