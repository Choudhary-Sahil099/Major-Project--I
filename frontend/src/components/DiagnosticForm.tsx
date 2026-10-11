import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  FileImage,
  Gauge,
  LoaderCircle,
  ScanEye,
  Upload,
  Zap,
} from 'lucide-react'

import type { ChangeEvent, DragEvent } from 'react'
import type { DiagnosticMode } from '../types'

type DiagnosticFormProps = {
  image: File | null
  imagePreview: string
  isDragging: boolean
  telemetry: string
  mode: DiagnosticMode
  error: string
  loading: boolean
  apiOnline: boolean
  modelLoaded: boolean
  setImage: (file: File | null) => void
  setIsDragging: (dragging: boolean) => void
  setTelemetry: (value: string) => void
  setMode: (mode: DiagnosticMode) => void
  handleImageSelection: (file: File | undefined) => void
  runDiagnosis: () => void | Promise<void>
}

export default function DiagnosticForm({
  image,
  imagePreview,
  isDragging,
  telemetry,
  mode,
  error,
  loading,
  apiOnline,
  modelLoaded,
  setImage,
  setIsDragging,
  setTelemetry,
  setMode,
  handleImageSelection,
  runDiagnosis,
}: DiagnosticFormProps) {
  return (
    <article className="panel input-panel">
      <div className="panel-heading">
        <div>
          <div className="section-kicker">INPUT CONFIGURATION</div>
          <h2>New diagnosis</h2>
        </div>
        <span className="step-badge">01 / INPUT</span>
      </div>

      <label className="field-label">
        THERMAL IMAGE <span>REQUIRED</span>
      </label>

      <label
        className={`upload-zone ${image ? 'upload-filled' : ''} ${
          isDragging ? 'upload-dragging' : ''
        }`}
        onDragEnter={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragOver={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault()

          if (
            !event.currentTarget.contains(
              event.relatedTarget as Node | null,
            )
          ) {
            setIsDragging(false)
          }
        }}
        onDrop={(event: DragEvent<HTMLLabelElement>) => {
          event.preventDefault()
          setIsDragging(false)
          handleImageSelection(event.dataTransfer.files[0])
        }}
      >
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            handleImageSelection(event.target.files?.[0])
          }
        />

        {imagePreview ? (
          <img
            className="image-preview"
            src={imagePreview}
            alt="Selected thermal image preview"
          />
        ) : (
          <>
            <span className="upload-icon">
              <Upload size={22} />
            </span>
            <strong>Drop a thermal image here</strong>
            <span>or click to browse your files</span>
            <small>
              <FileImage size={13} /> PNG, JPG or WEBP
            </small>
          </>
        )}
      </label>

      {image && (
        <div className="file-row">
          <FileImage size={15} />
          <span>{image.name}</span>
          <button
            type="button"
            onClick={() => setImage(null)}
          >
            Remove
          </button>
        </div>
      )}

      <div className="field-heading">
        <label className="field-label" htmlFor="telemetry">
          SENSOR TELEMETRY <span>30 × 4</span>
        </label>
        <span className="field-hint">V · I · T · R</span>
      </div>

      <textarea
        id="telemetry"
        className="telemetry-input"
        value={telemetry}
        onChange={(event) => setTelemetry(event.target.value)}
        placeholder="Paste a JSON array containing 30 rows of [voltage, current, temperature, resistance] values..."
        spellCheck={false}
      />

      <div className="telemetry-help">
        <Activity size={14} />
        30 time steps · 4 numeric sensor readings per step
      </div>

      <div className="mode-selector">
        <button
          type="button"
          className={mode === 'predict' ? 'mode-active' : ''}
          onClick={() => setMode('predict')}
        >
          <Gauge size={15} /> Prediction
        </button>

        <button
          type="button"
          className={mode === 'explain' ? 'mode-active' : ''}
          onClick={() => setMode('explain')}
        >
          <ScanEye size={15} /> Full explanation
        </button>
      </div>

      {error && (
        <div className="error-message" role="alert">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <button
        type="button"
        className="run-button"
        onClick={runDiagnosis}
        disabled={loading || !apiOnline || !modelLoaded}
      >
        {loading ? (
          <LoaderCircle size={17} className="spin" />
        ) : (
          <Zap size={17} />
        )}

        {loading
          ? 'Analyzing battery...'
          : mode === 'explain'
            ? 'Run diagnostic + explain'
            : 'Run battery diagnosis'}

        {!loading && <ArrowUpRight size={17} />}
      </button>

      {(!apiOnline || !modelLoaded) && (
        <p className="api-notice">
          Start the FastAPI backend and ensure the model is loaded to
          run diagnostics.
        </p>
      )}
    </article>
  )
}