# Wifsimster Resume

🎮 **Immersive WebGL Resume for Damien Battistella**

An interactive, infinite-scroll resume website featuring 9 unique WebGL 3D scenes, gaming-inspired UI elements, and bilingual support (FR/EN).

![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-r170-black?logo=three.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06b6d4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)

## ✨ Features

- **9 WebGL 3D Sections** - Each section has a unique Three.js scene with custom animations
- **Gaming-Inspired UI** - XP progress bar, 20 unlockable achievements, easter eggs
- **Bilingual** - French and English with automatic browser detection
- **Responsive** - Works on desktop and mobile devices
- **Performance Optimized** - Quality toggle, lazy loading, code splitting

## 🛠️ Tech Stack

| Technology | Version | Description |
|------------|---------|-------------|
| **Vue 3** | 3.5 | Progressive JavaScript framework |
| **Vite** | 6 | Next generation frontend tooling |
| **TailwindCSS** | 4 | Utility-first CSS framework |
| **TresJS** | 4.3 | Vue + Three.js integration |
| **Three.js** | r170 | WebGL 3D library |
| **Vue I18n** | 9.14 | Internationalization |
| **TypeScript** | 5.6 | Type safety |

## 🚀 Getting Started

### Prerequisites

- Node.js 24+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint
```

## 🐳 Docker Deployment

### Build and run locally

```bash
# Build the image
docker build -t wifsimster-resume .

# Run the container
docker run -p 80:80 wifsimster-resume
```

### Push to Docker Hub

```bash
# Tag and push
docker tag wifsimster-resume wifsimster/resume:latest
docker push wifsimster/resume:latest
```

### Deploy with Traefik

The container is ready to be deployed behind Traefik reverse proxy with health check enabled.

## 🎯 Sections

| # | Section | Theme | Description |
|---|---------|-------|-------------|
| 1 | **Hero** | The Knowledge Architect | Passion spheres floating in space |
| 2 | **About** | Share, Build, Play | Three interconnected worlds |
| 3 | **Experience** | The Evolution | Server rack timeline |
| 4 | **Leadership** | Knowledge Multiplier | Team amphitheater |
| 5 | **Skills** | The Skill Tree | Carpenter's workbench |
| 6 | **Maker** | Electronics Lab | IoT workspace |
| 7 | **Projects** | Open Source Gallery | Floating project cards |
| 8 | **Books** | The Library | Cozy reading nook |
| 9 | **Contact** | Join My Party | Collaboration desk |

## 🏆 Achievements System

Unlock 20 achievements by exploring the site:

| Achievement | Icon | Description |
|-------------|------|-------------|
| Welcome | 👋 | First time visiting |
| Return Visitor | 🔄 | Came back for more |
| Explorer | 🗺️ | Visited all sections |
| Bookworm | 📚 | Viewed all books |
| Code Hunter | 🎮 | Found the Konami code |
| Networker | 🔗 | Clicked all social links |
| Speed Runner | ⚡ | Scrolled through site in < 30s |
| Bilingual | 🌍 | Switched language |
| Night Owl | 🦉 | Visited in dark mode |
| Early Bird | 🌅 | Visited between 5AM and 8AM |
| Weekend Warrior | 🎉 | Visited on a weekend |
| Deep Diver | 🤿 | Spent 5+ minutes exploring |
| Scroll Master | 📜 | Scrolled over 10,000 pixels |
| Click Happy | 🖱️ | Clicked 50 times |
| Graphics Guru | 🎨 | Toggled quality settings |
| Maker Fan | 🔧 | Explored the maker section |
| Patient One | ⏳ | Waited for all 3D to load |
| Reach Out | ✉️ | Opened contact section |
| Open Sourcer | 🐙 | Clicked on a GitHub link |
| Completionist | 🏆 | Unlocked all achievements |

## 🎮 Hidden Features

- **Konami Code** - ↑↑↓↓←→←→BA for secret mode
- **Quality Toggle** - Switch between Low/High quality for performance
- **Progress Bar** - XP bar shows scroll progress through sections

## 📦 Project Structure

```
src/
├── application/        # Composables, i18n config
│   ├── composables/    # Vue composables (achievements, easter eggs, quality, scroll)
│   └── i18n/           # i18n configuration
├── domain/             # Business logic
│   ├── data/           # Resume data
│   └── types/          # TypeScript types
├── locales/            # Translation files
│   ├── en/             # English translations
│   └── fr/             # French translations
├── presentation/       # UI layer
│   ├── components/
│   │   ├── sections/   # Page sections (Hero, About, Skills, etc.)
│   │   ├── three/      # Three.js scenes for each section
│   │   └── ui/         # UI components (achievements, language switcher, etc.)
│   ├── styles/         # Global CSS styles
│   └── views/          # Page views
├── App.vue             # Root component
└── main.ts             # Application entry point
```

## 🔧 Configuration

### Vite Aliases

The project uses path aliases for cleaner imports:

- `@application/*` → `src/application/*`
- `@domain/*` → `src/domain/*`
- `@presentation/*` → `src/presentation/*`

### Environment

- Development: `npm run dev` (HMR enabled)
- Production: Built with tree-shaking and code splitting

## 👤 Author

**Damien Battistella** - [@Wifsimster](https://github.com/Wifsimster)

- Team Leader R&D at Dedalus
- Passionate JavaScript developer
- Raspberry Pi & ESP32 enthusiast
- Maker (woodworking, electronics, home renovation)

## 📄 License

MIT © 2025 Damien Battistella
