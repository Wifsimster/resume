# Wifsimster Resume

🎮 **Immersive WebGL Resume for Damien Battistella**

An interactive, infinite-scroll resume website featuring 9 unique WebGL 3D scenes, gaming-inspired UI elements, and bilingual support (FR/EN).

## ✨ Features

- **9 WebGL 3D Sections** - Each section has a unique Three.js scene
- **Gaming-Inspired UI** - XP progress bar, achievements, easter eggs
- **Bilingual** - French and English with browser detection
- **Responsive** - Works on desktop and mobile
- **Performance Optimized** - Quality toggle, lazy loading, code splitting

## 🛠️ Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite 6** - Next generation frontend tooling
- **TailwindCSS 4** - Utility-first CSS framework
- **TresJS** - Vue + Three.js integration
- **Three.js** - WebGL 3D library
- **Vue I18n** - Internationalization
- **TypeScript** - Type safety

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
docker tag wifsimster-resume wifisimter/resume:latest
docker push wifisimter/resume:latest
```

### Deploy with Traefik

The container is ready to be deployed behind Traefik reverse proxy.

## 🎯 Sections

1. **Hero** - The Knowledge Architect (passion spheres)
2. **About** - Share, Build, Play (three worlds)
3. **Experience** - The Evolution (server rack timeline)
4. **Leadership** - Knowledge Multiplier (team amphitheater)
5. **Skills** - The Skill Tree (carpenter's bench)
6. **Maker** - Electronics Lab (IoT workspace)
7. **Projects** - Open Source Gallery (floating cards)
8. **Books** - The Library (cozy reading nook)
9. **Contact** - Join My Party (collaboration desk)

## 🏆 Hidden Features

- **Konami Code** - ↑↑↓↓←→←→BA for secret mode
- **Achievements** - Unlock badges by exploring
- **Quality Toggle** - Switch between Low/High quality

## 📦 Project Structure

```
src/
├── domain/           # Business logic, types, data
├── application/      # Composables, i18n, services
├── infrastructure/   # Three.js, external APIs
├── presentation/     # Vue components, views, styles
└── locales/          # Translation files (fr, en)
```

## 👤 Author

**Damien Battistella** - [@Wifsimster](https://github.com/Wifsimster)

- Team Leader R&D at Dedalus
- Passionate JavaScript developer
- Raspberry Pi & ESP lover
- Maker (woodworking, electronics, renovation)

## 📄 License

MIT © 2025 Damien Battistella
