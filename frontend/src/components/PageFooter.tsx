type PageFooterProps = {
  apiOnline: boolean
}

export default function PageFooter({ apiOnline }: PageFooterProps) {
  return (
    <footer className="page-footer">
      <span>
        VOLT<span className="brand-accent">IQ</span>
        <i />
        Explainable multimodal battery diagnostics
      </span>

      <span>
        <span className={`status-dot ${apiOnline ? 'online' : ''}`} />
        {apiOnline
          ? 'Connected to local inference API'
          : 'Waiting for local inference API'}
      </span>
    </footer>
  )
}