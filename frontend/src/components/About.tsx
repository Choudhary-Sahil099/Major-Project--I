
import {
  BatteryCharging,
  BrainCircuit,
  Thermometer,
  ScanEye,
  Activity,
  Cpu,
  Database,
  Layers3,
} from "lucide-react";

export default function About() {
  return (
    <div className="about-page">
      <div className="about-header">
        <span className="about-eyebrow">ABOUT THE PROJECT</span>
        <h1>Understanding Battery Health, Beyond Predictions.</h1>
        <p>
          VOLTIQ is an explainable multimodal EV battery diagnostic
          system designed to assess battery health, identify thermal
          risks, and make machine learning predictions interpretable.
        </p>
      </div>

      <section className="about-section">
        <h2>Our Objective</h2>
        <p>
          Electric vehicle batteries are complex systems whose
          performance and safety depend on multiple interacting
          factors. VOLTIQ combines thermal imaging and battery
          telemetry to provide a more comprehensive diagnostic
          assessment.
        </p>
        <p>
          Our goal is not just to generate predictions, but also
          to explain the factors influencing those predictions.
        </p>
      </section>

      <section className="about-section">
        <h2>Core Capabilities</h2>

        <div className="about-feature-grid">
          <div className="about-feature">
            <BatteryCharging size={24} />
            <h3>SOH Estimation</h3>
            <p>
              Estimates battery State of Health using multimodal
              diagnostic inputs.
            </p>
          </div>

          <div className="about-feature">
            <Thermometer size={24} />
            <h3>Thermal Hazard Detection</h3>
            <p>
              Analyzes thermal patterns to identify potential
              battery safety risks.
            </p>
          </div>

          <div className="about-feature">
            <ScanEye size={24} />
            <h3>Visual Explainability</h3>
            <p>
              Uses Grad-CAM to highlight important regions
              influencing image-based predictions.
            </p>
          </div>

          <div className="about-feature">
            <Activity size={24} />
            <h3>Sensor Attribution</h3>
            <p>
              Uses Integrated Gradients to explain the
              contribution of telemetry features.
            </p>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>Technology Stack</h2>

        <div className="about-tech-grid">
          <div className="about-tech">
            <Cpu size={21} />
            <div>
              <h3>Machine Learning</h3>
              <p>MobileNetV2 · BiLSTM</p>
            </div>
          </div>

          <div className="about-tech">
            <Layers3 size={21} />
            <div>
              <h3>Explainable AI</h3>
              <p>Grad-CAM · Integrated Gradients</p>
            </div>
          </div>

          <div className="about-tech">
            <Database size={21} />
            <div>
              <h3>Backend</h3>
              <p>Python · FastAPI</p>
            </div>
          </div>

          <div className="about-tech">
            <BrainCircuit size={21} />
            <div>
              <h3>Frontend</h3>
              <p>React · TypeScript · Vite</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section about-mission">
        <h2>Why VOLTIQ?</h2>
        <p>
          A diagnostic prediction is more valuable when its
          reasoning can be understood. VOLTIQ brings battery
          health assessment and explainable artificial
          intelligence together to support more transparent
          EV battery diagnostics.
        </p>
      </section>
    </div>
  );
}
