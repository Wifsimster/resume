<template>
  <!-- Modern aurora-mesh backdrop: deep space gradient, three soft colour
       blobs drifting very slowly, a faint blueprint dot grid and a vignette.
       Pure CSS — zero JS, zero canvases; the drift pauses automatically for
       prefers-reduced-motion. -->
  <div class="app-background" aria-hidden="true">
    <div class="bg-blob bg-blob-violet" />
    <div class="bg-blob bg-blob-cyan" />
    <div class="bg-blob bg-blob-magenta" />
    <div class="bg-grid" />
    <div class="bg-vignette" />
  </div>
</template>

<style scoped>
.app-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
  background:
    radial-gradient(120% 90% at 50% 0%, #0d0818 0%, #070410 45%, #040208 100%);
}

/* Soft pre-blurred aurora blobs (radial gradients, no filter cost) */
.bg-blob {
  position: absolute;
  width: 70vmax;
  height: 70vmax;
  border-radius: 50%;
  will-change: transform;
}

.bg-blob-violet {
  top: -25vmax;
  left: -18vmax;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.16) 0%, rgba(124, 58, 237, 0) 62%);
  animation: blob-drift-a 52s ease-in-out infinite;
}

.bg-blob-cyan {
  bottom: -30vmax;
  right: -20vmax;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, rgba(34, 211, 238, 0) 60%);
  animation: blob-drift-b 64s ease-in-out infinite;
}

.bg-blob-magenta {
  top: 30%;
  left: 55%;
  width: 46vmax;
  height: 46vmax;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.08) 0%, rgba(236, 72, 153, 0) 58%);
  animation: blob-drift-c 74s ease-in-out infinite;
}

@keyframes blob-drift-a {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(9vmax, 6vmax, 0) scale(1.12); }
}

@keyframes blob-drift-b {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-8vmax, -7vmax, 0) scale(1.08); }
}

@keyframes blob-drift-c {
  0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(-10vmax, 8vmax, 0) scale(0.92); }
}

/* Faint blueprint dot grid, faded out toward the edges */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(196, 181, 253, 0.13) 1px, transparent 1px);
  background-size: 30px 30px;
  mask-image: radial-gradient(75% 65% at 50% 45%, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
  -webkit-mask-image: radial-gradient(75% 65% at 50% 45%, rgba(0, 0, 0, 0.9) 0%, transparent 100%);
}

/* Vignette keeps edges calm and text readable */
.bg-vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(110% 95% at 50% 50%, transparent 55%, rgba(2, 1, 5, 0.75) 100%);
}

@media (prefers-reduced-motion: reduce) {
  .bg-blob {
    animation: none;
  }
}
</style>
