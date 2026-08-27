import './AppBackground.css'

export default function AppBackground() {
  return (
    /* Modern aurora-mesh backdrop: deep space gradient, three soft colour
       blobs drifting very slowly, a faint blueprint dot grid and a vignette.
       Pure CSS — zero JS, zero canvases; the drift pauses automatically for
       prefers-reduced-motion. */
    <div className="app-background" aria-hidden="true">
      <div className="bg-blob bg-blob-violet" />
      <div className="bg-blob bg-blob-cyan" />
      <div className="bg-blob bg-blob-magenta" />
      <div className="bg-grid" />
      <div className="bg-vignette" />
    </div>
  )
}
