
import { useEffect, useState } from 'react'
import { fetchHealth } from '../services/diagnosticsApi'

export function useApiHealth() {
  const [apiOnline, setApiOnline] = useState(false)
  const [modelLoaded, setModelLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function checkHealth() {
      try {
        const data = await fetchHealth()

        if (!cancelled) {
          setApiOnline(true)
          setModelLoaded(data.model_loaded === true)
        }
      } catch {
        if (!cancelled) {
          setApiOnline(false)
          setModelLoaded(false)
        }
      }
    }

    void checkHealth()

    const timer = window.setInterval(checkHealth, 15000)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  return { apiOnline, modelLoaded }
}
