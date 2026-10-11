import type React from 'react'
import {
  BatteryCharging,
  ChevronRight,
  CircleHelp,
  Radio,
} from 'lucide-react'

type NavigationItem = {
  label: string
  icon: React.ComponentType<{ size?: number }>
}

type SidebarProps = {
  navigation: NavigationItem[]
  activeNav: string
  setActiveNav: (label: string) => void
  apiOnline: boolean
  modelLoaded: boolean
}

export default function Sidebar({
  navigation,
  activeNav,
  setActiveNav,
  apiOnline,
  modelLoaded,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <a
        className="brand"
        href="#"
        onClick={(event) => {
          event.preventDefault()
          setActiveNav('Overview')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
      >
        <span className="brand-icon">
          <BatteryCharging size={23} />
        </span>

        <span>
          <strong>
            VOLT<span className="brand-accent">IQ</span>
          </strong>
          <small>BATTERY INTELLIGENCE</small>
        </span>
      </a>

      <div className="side-label">WORKSPACE</div>

      <nav className="nav-list">
        {navigation.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`nav-item ${activeNav === label ? 'nav-active' : ''}`}
            onClick={() => {
              setActiveNav(label)

              const target =
                label === 'Diagnostics'
                  ? 'diagnostics'
                  : label === 'Explainable AI'
                    ? 'explainability'
                    : null

              if (target) {
                document
                  .getElementById(target)
                  ?.scrollIntoView({ behavior: 'smooth' })
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
          >
            <Icon size={18} />
            <span>{label}</span>

            {activeNav === label && (
              <ChevronRight size={15} className="nav-chevron" />
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="system-card">
        <div className="system-heading">
          <span className={`status-dot ${apiOnline ? 'online' : ''}`} />
          SYSTEM STATUS
        </div>

        <div className="system-row">
          <span>API connection</span>
          <span className={apiOnline ? 'text-good' : 'text-muted'}>
            {apiOnline ? 'Connected' : 'Offline'}
          </span>
        </div>

        <div className="system-row">
          <span>ML model</span>
          <span className={modelLoaded ? 'text-good' : 'text-muted'}>
            {modelLoaded ? 'Loaded' : 'Unavailable'}
          </span>
        </div>

        <div className="system-foot">
          <Radio size={13} />
          Checks every 15 seconds
        </div>
      </div>

      <div className="sidebar-footer">
        <span className="avatar">EV</span>
        <div>
          <strong>Research Console</strong>
          <small>Multimodal diagnostics</small>
        </div>
        <CircleHelp size={17} className="help-icon" />
      </div>
    </aside>
  )
}