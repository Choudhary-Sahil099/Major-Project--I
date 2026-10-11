import { ChevronRight } from 'lucide-react'

type TopbarProps = {
  activeNav: string
  apiOnline: boolean
}

export default function Topbar({
  activeNav,
  apiOnline,
}: TopbarProps) {
  return (
    <header className="topbar">
      <div className="breadcrumbs">
        Workspace <ChevronRight size={14} />
        <span>{activeNav}</span>
      </div>

      <div className="topbar-right">
        <span className="environment-tag">
          <span /> LOCAL ENVIRONMENT
        </span>

        <div className="topbar-divider" />

        <div className="api-indicator">
          <span className={`status-dot ${apiOnline ? 'online' : ''}`} />
          {apiOnline ? 'API online' : 'API disconnected'}
        </div>
      </div>
    </header>
  )
}