# Wifsimster Resume

🎮 **Immersive WebGL Resume for Damien Battistella**

An interactive, infinite-scroll resume website featuring three WebGL 3D scenes (solar system hero, space companion, maker desk & server rack), gaming-inspired UI elements, and bilingual support (FR/EN).

![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript)
![Three.js](https://img.shields.io/badge/Three.js-r182-black?logo=three.js)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06b6d4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)
![Docker](https://img.shields.io/docker/v/wifsimster/resume?label=Docker%20Hub&logo=docker)
![GitHub Actions](https://img.shields.io/github/actions/workflow/status/Wifsimster/resume/release.yml?label=CI&logo=github)

## ✨ Features

- **WebGL 3D Scenes** - Solar system hero, space companion cruising across sections, and a maker desk with a full server rack — all lazy-loaded
- **Gaming-Inspired UI** - XP progress bar, 30 unlockable achievements, easter eggs
- **Bilingual** - French and English with automatic browser detection
- **Responsive** - Works on desktop and mobile devices
- **Performance Optimized** - Quality toggle, lazy loading, code splitting
- **Mobile Optimized** - Frame rate limiting, visibility-based pausing, battery-aware quality degradation

## 🛠️ Tech Stack

| Technology | Version | Description |
|------------|---------|-------------|
| **React** | 19 | UI library |
| **Vite** | 8 | Next generation frontend tooling |
| **TailwindCSS** | 4 | Utility-first CSS framework |
| **React Three Fiber** | 9 | React + Three.js integration |
| **Three.js** | r182 | WebGL 3D library |
| **i18next** | 26 | Internationalization (react-i18next) |
| **zustand** | 5 | State management |
| **TypeScript** | 5.9 | Type safety |

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

# Version bump (patch/minor/major)
npm run version:patch
```

## 🐳 Docker

The Docker image is published to [Docker Hub](https://hub.docker.com/r/wifsimster/resume) as `wifsimster/resume`.

### Run from Docker Hub

```bash
docker run -p 80:80 wifsimster/resume:latest
```

### Manual publishing

```bash
# Full release pipeline: build app, build image, tag, push
npm run release

# Or step by step:
npm run docker:build   # Build image with version tags
npm run docker:tag     # Create semver tags (major, minor)
npm run docker:push    # Push all tags to Docker Hub
```

### Build locally

```bash
docker build -t wifsimster/resume .
docker run -p 80:80 wifsimster/resume
```

### Deploy with Traefik

The container is ready to be deployed behind Traefik reverse proxy with health check enabled.

## 🔄 CI/CD

GitHub Actions automatically runs on every push to `main` (`.github/workflows/release.yml`):

1. Detects version bump type from conventional commits (`feat:` = minor, `feat!:` = major, otherwise patch)
2. Bumps `package.json` version
3. Builds and pushes a multi-platform Docker image (linux/amd64 + linux/arm64) to Docker Hub
4. Tags: `latest`, `vX.Y.Z`, `X.Y`, `X`
5. Creates a GitHub Release with auto-generated changelog

You can also trigger manually via `workflow_dispatch` to choose the version bump type.

### Required secrets

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |

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
- **Quality Toggle** - Switch between Minimal/Low/High quality for performance
- **Progress Bar** - XP bar shows scroll progress through sections

## ⚡ Performance Optimizations

### Mobile Animation Optimizations

The application includes comprehensive mobile optimizations to ensure smooth performance and battery efficiency:

- **Frame Rate Limiting**: Automatically targets 30fps on mobile devices (60fps on desktop)
- **Visibility-Based Pausing**: Animations pause when sections are off-screen (<10% visible), reducing CPU/GPU usage
- **Battery Awareness**: Quality automatically degrades when battery is low and not charging
- **Thermal Throttling Detection**: Auto-degrades quality when FPS drops suddenly (thermal throttling)
- **GPU Acceleration**: CSS animations use GPU-accelerated properties (`transform`, `opacity`) with `will-change` hints
- **Mobile-Specific Settings**: Lower DPR (max 1.5), reduced particle counts, fewer lights on mobile

### Quality System

The quality system automatically detects device capabilities and adjusts settings:

- **Minimal**: 30fps target, no particles, reduced geometry, low-power mode
- **Low**: 30fps mobile / 45fps desktop, reduced particles, medium geometry
- **High**: 30fps mobile / 60fps desktop, full particles, high geometry

Quality detection considers:
- GPU tier (low/medium/high)
- CPU cores
- Device memory
- Mobile device detection
- High DPR displays
- Battery level (if available)
- `prefers-reduced-motion` preference

### CSS Optimizations

- All animations use GPU-accelerated properties
- `will-change` hints for better browser optimization
- Faster animation durations on mobile devices
- Respects `prefers-reduced-motion` for accessibility

## 📦 Project Structure

```
src/
├── application/        # Hooks, stores, i18n config
│   ├── hooks/          # React hooks
│   ├── stores/         # zustand stores (quality, achievements)
│   │   ├── useAchievements.ts      # Achievement system
│   │   ├── useAnimationController.ts  # Animation controller with mobile optimizations
│   │   ├── useEasterEggs.ts        # Easter eggs (Konami code, etc.)
│   │   ├── useQuality.ts           # Quality system with auto-detection
│   │   └── useScrollSection.ts     # Scroll tracking with visibility detection
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
│   │   │   └── scenes/ # Individual 3D scenes (HeroScene, AboutScene, etc.)
│   │   └── ui/         # UI components (achievements, language switcher, etc.)
│   ├── styles/         # Global CSS styles with mobile optimizations
│   └── views/          # Page views
├── App.tsx             # Root component
└── main.tsx            # Application entry point
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
