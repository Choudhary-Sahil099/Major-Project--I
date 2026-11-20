import { useEffect, useState } from "react";
import { submitDiagnosis } from "./services/diagnosticsApi";
import DashboardOverview from "./components/DashboardOverview";
import { useApiHealth } from "./hooks/useApiHealth";
import DiagnosticForm from "./components/DiagnosticForm"; // if it don't work try only changing the file name to DiagnosticForm
import DiagnosticResults from "./components/DiagnosticResult";
import type { Prediction } from "./types";
import Sidebar from "./components/Sidebar";
import { saveHistory } from "./services/historyStorage";
import type { HistoryRecord } from "./types/history";
import "./App.css";
import {
  Activity,
  LayoutDashboard,
  ScanEye,
  RotateCcwClock,
  Info,
} from "lucide-react";

import Topbar from "./components/Topbar";
import ExplainabilityPanel from "./components/ExplainabilityPanel";
import PageFooter from "./components/PageFooter";
import About from "./components/About";
import History from "./components/History";
const navigation = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Diagnostics", icon: Activity },
  { label: "Explainable AI", icon: ScanEye },
  { label: "History", icon: RotateCcwClock },
  { label: "About", icon: Info },
];

function App() {
  const [activeNav, setActiveNav] = useState("Overview");
  const { apiOnline, modelLoaded } = useApiHealth();
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [telemetry, setTelemetry] = useState("");
  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"predict" | "explain">("predict");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return;
    }

    const url = URL.createObjectURL(image);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [image]);

  function handleImageSelection(file?: File) {
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a PNG, JPG, or WEBP image.");
      return;
    }

    setError("");
    setImage(file);
  }

  async function runDiagnosis() {
    setError("");
    setResult(null);

    if (!image) {
      setError("Please upload a thermal image first.");
      return;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(telemetry);
    } catch {
      setError(
        "Telemetry must be valid JSON containing 30 rows of four numbers.",
      );
      return;
    }

    if (
      !Array.isArray(parsed) ||
      parsed.length !== 30 ||
      !parsed.every(
        (row: unknown) =>
          Array.isArray(row) &&
          row.length === 4 &&
          row.every(
            (value: unknown) =>
              typeof value === "number" && Number.isFinite(value),
          ),
      )
    ) {
      setError(
        "Telemetry must contain exactly 30 rows of four finite numbers: [V, I, T, R].",
      );
      return;
    }

    setLoading(true);

    try {
      const prediction = await submitDiagnosis(
        image,
        parsed as number[][],
        mode,
      );

      setResult(prediction);
      const historyRecord: HistoryRecord = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        mode,
        imageName: image.name,
        prediction,
      };

      saveHistory(historyRecord);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reach the diagnostic API.",
      );
    } finally {
      setLoading(false);
    }
  }

  const riskColor =
    result?.risk_class_id === 2
      ? "#fb7185"
      : result?.risk_class_id === 1
        ? "#fbbf24"
        : "#5eead4";

  const probabilities = result
    ? Object.entries(result.probabilities).map(([name, value]) => ({
        name,
        value: value * 100,
      }))
    : [];

  const attributions = result?.sensor_attributions
    ? Object.entries(result.sensor_attributions).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <div className="app-shell">
      <Sidebar
        navigation={navigation}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        apiOnline={apiOnline}
        modelLoaded={modelLoaded}
      />

      <main className="main-content">
        <Topbar activeNav={activeNav} apiOnline={apiOnline} />

        <div className="page-content">
          {activeNav === "History" ? (
            <History />
          ) : activeNav === "About" ? (
            <About />
          ) : (
            <>
              <DashboardOverview result={result} riskColor={riskColor} />

              <section id="diagnostics" className="workspace-grid">
                <DiagnosticForm
                  image={image}
                  imagePreview={imagePreview}
                  isDragging={isDragging}
                  telemetry={telemetry}
                  mode={mode}
                  error={error}
                  loading={loading}
                  apiOnline={apiOnline}
                  modelLoaded={modelLoaded}
                  setImage={setImage}
                  setIsDragging={setIsDragging}
                  setTelemetry={setTelemetry}
                  setMode={setMode}
                  handleImageSelection={handleImageSelection}
                  runDiagnosis={runDiagnosis}
                />

                <DiagnosticResults
                  result={result}
                  riskColor={riskColor}
                  probabilities={probabilities}
                />
              </section>

              <section id="explainability">
                <ExplainabilityPanel
                  result={result}
                  attributions={attributions}
                />
              </section>
            </>
          )}

          <PageFooter apiOnline={apiOnline} />
        </div>
      </main>
    </div>
  );
}

export default App;
