
import type { HistoryRecord } from "../types/history";

const STORAGE_KEY = "voltiq_diagnostic_history";

export function getHistory(): HistoryRecord[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) return [];

    return JSON.parse(stored) as HistoryRecord[];
  } catch (error) {
    console.error("Unable to retrieve diagnostic history:", error);
    return [];
  }
}

export function saveHistory(record: HistoryRecord): void {
  const history = getHistory();

  history.unshift(record);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history)
  );
}

export function deleteHistory(id: string): void {
  const updatedHistory = getHistory().filter(
    (record) => record.id !== id
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedHistory)
  );
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
