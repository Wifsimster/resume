import './AppBackground.css'

export default function AppBackground() {
  return (
    <div className="app-background" aria-hidden="true">
      <div className="bg-blob bg-blob-violet" />
      <div className="bg-blob bg-blob-cyan" />
      <div className="bg-blob bg-blob-magenta" />
      <div className="bg-grid" />
      <div className="bg-vignette" />
    </div>
  )
}
