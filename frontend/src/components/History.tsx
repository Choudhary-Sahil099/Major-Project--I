
import { useState } from "react";
import {
  getHistory,
  deleteHistory,
  clearHistory,
} from "../services/historyStorage";
import type { HistoryRecord } from "../types/history";

export default function History() {
  const [records, setRecords] = useState<HistoryRecord[]>(getHistory);
  const [selectedRecord, setSelectedRecord] =
    useState<HistoryRecord | null>(null);

  const averageSOH =
    records.length > 0
      ? records.reduce(
          (sum, record) => sum + record.prediction.soh_percentage,
          0
        ) / records.length
      : 0;

  const highRiskCount = records.filter(
    (record) => record.prediction.risk_class_id === 2
  ).length;

  function handleDelete(id: string) {
    deleteHistory(id);

    setRecords((previous) =>
      previous.filter((record) => record.id !== id)
    );

    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  }

  function handleClearHistory() {
    if (!window.confirm("Are you sure you want to delete all diagnostic history?")) {
      return;
    }

    clearHistory();
    setRecords([]);
    setSelectedRecord(null);
  }

  function formatDate(timestamp: string) {
    return new Date(timestamp).toLocaleString();
  }

  return (
    <div className="history-page">
      <div>
        <h1>Diagnostic History</h1>
        <p>
          Review previous EV battery diagnostic results and
          track battery health assessments.
        </p>
      </div>

      {/* Summary statistics */}

      <div className="history-stats">
        <div className="history-stat">
          <h3>Total Diagnostics</h3>
          <strong>{records.length}</strong>
        </div>

        <div className="history-stat">
          <h3>Average SOH</h3>
          <strong>{records.length ? `${averageSOH.toFixed(2)}%` : "—"}</strong>
        </div>

        <div className="history-stat">
          <h3>High Risk Cases</h3>
          <strong>{highRiskCount}</strong>
        </div>
      </div>

      {/* Diagnostic records */}

      <div className="history-list-header">
        <h2>Previous Diagnostics</h2>

        {records.length > 0 && (
          <button onClick={handleClearHistory}>
            Clear History
          </button>
        )}
      </div>

      {records.length === 0 ? (
        <div className="history-empty">
          <h3>No Diagnostic Records Found</h3>
          <p>
            Your completed battery diagnostics will appear here.
            Run your first diagnosis to get started.
          </p>
        </div>
      ) : (
        <div className="history-records">
          {records.map((record) => (
            <div className="history-record" key={record.id}>
              <div className="history-record-info">
                <h3>{record.imageName}</h3>

                <p>{formatDate(record.timestamp)}</p>

                <span>
                  Mode: {record.mode.toUpperCase()}
                </span>
              </div>

              <div className="history-record-metric">
                <small>Battery SOH</small>
                <strong>
                  {record.prediction.soh_percentage.toFixed(2)}%
                </strong>
              </div>

              <div className="history-record-metric">
                <small>Risk Classification</small>
                <strong>
                  {record.prediction.risk_state}
                </strong>
              </div>

              <div className="history-record-actions">
                <button
                  onClick={() => setSelectedRecord(record)}
                >
                  View Report
                </button>

                <button
                  onClick={() => handleDelete(record.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected diagnostic details */}

      {selectedRecord && (
        <div className="history-details">
          <h2>Diagnostic Report Details</h2>

          <button
            onClick={() => setSelectedRecord(null)}
          >
            Close Report
          </button>

          <p>
            <strong>Diagnostic ID:</strong>{" "}
            {selectedRecord.id}
          </p>

          <p>
            <strong>Date:</strong>{" "}
            {formatDate(selectedRecord.timestamp)}
          </p>

          <p>
            <strong>Image:</strong>{" "}
            {selectedRecord.imageName}
          </p>

          <p>
            <strong>SOH:</strong>{" "}
            {selectedRecord.prediction.soh_percentage.toFixed(2)}%
          </p>

          <p>
            <strong>Risk:</strong>{" "}
            {selectedRecord.prediction.risk_state}
          </p>

          <p>
            <strong>Confidence:</strong>{" "}
            {(selectedRecord.prediction.confidence * 100).toFixed(2)}%
          </p>

          <h3>Risk Probabilities</h3>

          {Object.entries(selectedRecord.prediction.probabilities).map(
            ([name, value]) => (
              <p key={name}>
                {name}: {(value * 100).toFixed(2)}%
              </p>
            )
          )}

          {selectedRecord.prediction.sensor_attributions && (
            <>
              <h3>Sensor Attributions</h3>

              {Object.entries(
                selectedRecord.prediction.sensor_attributions
              ).map(([name, value]) => (
                <p key={name}>
                  {name}: {value.toFixed(4)}
                </p>
              ))}
            </>
          )}

          {selectedRecord.prediction.gradcam_base64 && (
            <>
              <h3>Grad-CAM Visualization</h3>

              <img
                src={`data:image/png;base64,${selectedRecord.prediction.gradcam_base64}`}
                alt="Historical Grad-CAM visualization"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
