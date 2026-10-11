export type Prediction = {
  soh_percentage: number
  risk_state: string
  risk_class_id: number
  confidence: number
  probabilities: Record<string, number>
  gradcam_base64?: string
  sensor_attributions?: Record<string, number>
}


// this is the health response is based on the modle output
export type HealthResponse = {
  status: string 
  model_loaded: boolean // check if the model is loaded
  supported_classes: string[]
}

export type DiagnosticMode = 'predict' | 'explain' // make it more dynamic