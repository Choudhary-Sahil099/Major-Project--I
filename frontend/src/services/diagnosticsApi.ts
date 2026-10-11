import type {
  DiagnosticMode,
  HealthResponse,
  Prediction,
} from '../types'

const API_BASE_URL = 'http://127.0.0.1:8000'

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/health`)

  if (!response.ok) {
    throw new Error('Health check failed')
  }

  return response.json() as Promise<HealthResponse>
}

export async function submitDiagnosis(
  image: File,
  telemetry: number[][],
  mode: DiagnosticMode,
): Promise<Prediction> {
  const form = new FormData()

  form.append('image_file', image)
  form.append('telemetry_data', JSON.stringify(telemetry))

  const endpoint =
    mode === 'explain' ? '/api/v1/explain' : '/api/v1/predict'

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: form,
  })

  const data: unknown = await response.json()

  if (!response.ok) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'detail' in data &&
      typeof data.detail === 'string'
        ? data.detail
        : 'The diagnostic request failed.'

    throw new Error(message)
  }

  return data as Prediction
}