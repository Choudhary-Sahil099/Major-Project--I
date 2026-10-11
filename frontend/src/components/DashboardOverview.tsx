import {
  BatteryCharging,
  Cpu,
  Gauge,
  Microscope,
  ScanEye,
  ShieldCheck,
  Zap,
} from 'lucide-react'

import type { Prediction } from '../types'

type DashboardOverviewProps = {
  result: Prediction | null
  riskColor: string
}

export default function DashboardOverview({
  result,
  riskColor,
}: DashboardOverviewProps) {
  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow">
            <Zap size={13} />
            MULTIMODAL DIAGNOSTICS PLATFORM
          </div>

          <h1>
            Battery intelligence<span>.</span>
          </h1>

          <p>
            Analyze battery health, identify thermal risks, and explore
            model explanations.
          </p>
        </div>

        <div className="model-chip">
          <span className="model-chip-icon">
            <Cpu size={17} />
          </span>
          <div>
            <strong>Deep learning engine</strong>
            <small>Vision + temporal fusion</small>
          </div>
        </div>
      </section>

      <section className="metric-grid">
        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-icon teal">
              <BatteryCharging size={19} />
            </span>
            <span className="metric-label">STATE OF HEALTH</span>
          </div>

          <div className={result ? 'metric-value' : 'metric-empty'}>
            {result ? result.soh_percentage.toFixed(2) : '—'}
            <small>%</small>
          </div>

          <div className="metric-foot">
            {result ? 'Latest model estimate' : 'Awaiting first diagnosis'}
          </div>

          <div className="metric-track">
            <div
              style={{
                width: `${result ? Math.max(0, Math.min(100, result.soh_percentage)) : 0}%`,
              }}
            />
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-icon amber">
              <ShieldCheck size={19} />
            </span>
            <span className="metric-label">RISK CLASSIFICATION</span>
          </div>

          <div
            className="risk-value"
            style={{ color: result ? riskColor : undefined }}
          >
            {result?.risk_state ?? 'Not assessed'}
          </div>

          <div className="metric-foot">
            {result
              ? `Class ID ${result.risk_class_id}`
              : 'Run a diagnosis to classify risk'}
          </div>

          <div
            className="risk-line"
            style={{ background: result ? riskColor : undefined }}
          />
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-icon blue">
              <Gauge size={19} />
            </span>
            <span className="metric-label">MODEL CONFIDENCE</span>
          </div>

          <div className={result ? 'metric-value' : 'metric-empty'}>
            {result ? result.confidence.toFixed(2) : '—'}
            <small>%</small>
          </div>

          <div className="metric-foot">
            {result ? 'Score for predicted class' : 'No inference performed yet'}
          </div>

          <div className="metric-track blue-track">
            <div
              style={{
                width: `${result ? Math.max(0, Math.min(100, result.confidence)) : 0}%`,
              }}
            />
          </div>
        </article>

        <article className="metric-card">
          <div className="metric-top">
            <span className="metric-icon violet">
              <Microscope size={19} />
            </span>
            <span className="metric-label">EXPLAINABILITY</span>
          </div>

          <div className="risk-value">
            {result?.gradcam_base64 ? 'Available' : 'Ready to run'}
          </div>

          <div className="metric-foot">
            {result?.gradcam_base64
              ? 'Grad-CAM generated'
              : 'Visual + sensor analysis'}
          </div>

          <div className="metric-badge">
            <ScanEye size={13} /> Grad-CAM · Attributions
          </div>
        </article>
      </section>
    </>
  )
}