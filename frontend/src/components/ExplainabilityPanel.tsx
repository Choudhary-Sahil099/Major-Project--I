import { Activity, ScanEye } from 'lucide-react'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { Prediction } from '../types'

type Attribution = {
  name: string
  value: number
}

type ExplainabilityPanelProps = {
  result: Prediction | null
  attributions: Attribution[]
}

export default function ExplainabilityPanel({
  result,
  attributions,
}: ExplainabilityPanelProps) {
  return (
    <section id="explainability" className="explain-grid">
      <article className="panel explain-panel">
        <div className="panel-heading">
          <div>
            <div className="section-kicker">SPATIAL EXPLANATION</div>
            <h2>Thermal attention map</h2>
          </div>
          <ScanEye size={19} className="heading-icon" />
        </div>

        {result?.gradcam_base64 ? (
          <div className="gradcam-container">
            <img
              src={result.gradcam_base64}
              alt="Grad-CAM thermal attention overlay from the model"
            />
            <span className="image-caption">
              <span /> GRAD-CAM OVERLAY
            </span>
          </div>
        ) : (
          <div className="explain-empty">
            <ScanEye size={27} />
            <strong>No heatmap generated</strong>
            <span>
              Choose Full explanation when running a diagnosis to generate
              a Grad-CAM overlay.
            </span>
          </div>
        )}
      </article>

      <article className="panel explain-panel">
        <div className="panel-heading">
          <div>
            <div className="section-kicker">TEMPORAL EXPLANATION</div>
            <h2>Sensor attributions</h2>
          </div>
          <Activity size={19} className="heading-icon" />
        </div>

        {attributions.length > 0 ? (
          <>
            <div className="attribution-chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attributions}
                  layout="vertical"
                  margin={{ left: 8, right: 15, top: 5, bottom: 5 }}
                >
                  <CartesianGrid
                    stroke="#243044"
                    strokeDasharray="3 3"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: '#8291a8', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={112}
                    tick={{ fill: '#a9b8cc', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#111b2a',
                      border: '1px solid #2b3a50',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    name="Attribution"
                    radius={[0, 4, 4, 0]}
                  >
                    {attributions.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.value >= 0 ? '#5eead4' : '#fb7185'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <p className="attribution-note">
              Signed attribution values are shown as returned by the
              model&apos;s explanation method.
            </p>
          </>
        ) : (
          <div className="explain-empty">
            <Activity size={27} />
            <strong>Attributions will appear here</strong>
            <span>
              Run a full explanation to inspect the model&apos;s reported
              sensor contributions.
            </span>
          </div>
        )}
      </article>
    </section>
  )
}