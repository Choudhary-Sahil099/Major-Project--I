import {
  BatteryCharging,
  CheckCircle2,
} from 'lucide-react'

import type { CSSProperties } from 'react'
import type { Prediction } from '../types'

type ProbabilityItem = {
  name: string
  value: number
}

type DiagnosticResultsProps = {
  result: Prediction | null
  riskColor: string
  probabilities: ProbabilityItem[]
}

const probabilityColors = ['#5eead4', '#fbbf24', '#fb7185']

export default function DiagnosticResults({
  result,
  riskColor,
  probabilities,
}: DiagnosticResultsProps) {
  return (
    <article className="panel result-panel">
      <div className="panel-heading">
        <div>
          <div className="section-kicker">INFERENCE OUTPUT</div>
          <h2>Diagnostic results</h2>
        </div>

        <span className={`result-status ${result ? 'result-ready' : ''}`}>
          <span />
          {result ? 'RESULT READY' : 'AWAITING INPUT'}
        </span>
      </div>

      {!result ? (
        <div className="empty-results">
          <div className="empty-graphic">
            <div className="empty-ring ring-one" />
            <div className="empty-ring ring-two" />
            <div className="empty-center">
              <BatteryCharging size={33} />
            </div>
            <span className="empty-spark spark-one" />
            <span className="empty-spark spark-two" />
          </div>

          <h3>Your next insight starts here</h3>
          <p>
            Upload a thermal frame and provide its matching telemetry
            sequence. Your model&apos;s results will appear in this
            workspace.
          </p>

          <div className="empty-steps">
            <span>
              <CheckCircle2 size={14} /> Thermal image
            </span>
            <span>
              <CheckCircle2 size={14} /> 30-step telemetry
            </span>
            <span>
              <CheckCircle2 size={14} /> Model inference
            </span>
          </div>
        </div>
      ) : (
        <div className="results-body">
          <div
            className="result-highlight"
            style={{ borderColor: `${riskColor}55` }}
          >
            <div
              className="result-gauge"
              style={
                {
                  '--gauge-color': riskColor,
                  '--gauge-value': `${Math.max(
                    0,
                    Math.min(100, result.soh_percentage),
                  )}%`,
                } as CSSProperties
              }
            >
              <div>
                <strong>
                  {result.soh_percentage.toFixed(1)}
                  <small>%</small>
                </strong>
                <span>STATE OF HEALTH</span>
              </div>
            </div>

            <div className="result-summary">
              <span className="section-kicker">
                PREDICTED RISK STATE
              </span>
              <h3 style={{ color: riskColor }}>{result.risk_state}</h3>
              <p>
                Class confidence:{' '}
                <strong>{result.confidence.toFixed(2)}%</strong>
              </p>
              <span className="class-tag">
                CLASS {result.risk_class_id}
              </span>
            </div>
          </div>

          <div className="chart-heading">
            <h3>Risk probability distribution</h3>
            <span>MODEL OUTPUT</span>
          </div>

          <div className="probability-list">
            {probabilities.map((item, index) => {
              const color =
                probabilityColors[index % probabilityColors.length]

              return (
                <div className="probability-item" key={item.name}>
                  <div className="probability-label">
                    <span>
                      <i style={{ background: color }} />
                      {item.name}
                    </span>
                    <strong>{item.value.toFixed(2)}%</strong>
                  </div>

                  <div className="probability-track">
                    <div
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, item.value),
                        )}%`,
                        background: color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <p className="result-disclaimer">
            Model estimates are decision-support information, not a
            guarantee of battery safety.
          </p>
        </div>
      )}
    </article>
  )
}