import { useState, useRef, useCallback, useEffect } from 'react'

const CRIME_TYPES = ['Robbery', 'Theft', 'Assault', 'Burglary', 'Fraud', 'Chain Snatching']
const EVENT_TYPES = ['new_fir', 'evidence_match', 'chargesheet_update', 'alert']

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function makeFirNo() {
  const n = String(100 + Math.floor(Math.random() * 900)).padStart(4, '0')
  return `KSP-2026-${n}`
}

function generateEvent(id) {
  const type = randomItem(EVENT_TYPES)
  const crime = randomItem(CRIME_TYPES)
  const firNo = makeFirNo()
  const templates = {
    new_fir: { title: `New FIR ${firNo} filed`, description: `Crime: ${crime} — Brigade Road PS` },
    evidence_match: { title: `Evidence match found for ${firNo}`, description: `Linked to 2 existing cases (${Math.floor(60 + Math.random() * 35)}% match confidence)` },
    chargesheet_update: { title: `Chargesheet update: ${firNo}`, description: `Readiness score: ${Math.floor(50 + Math.random() * 45)}% — ${Math.floor(10 + Math.random() * 60)} days remaining` },
    alert: { title: `Alert: ${crime} hotspot`, description: `Elevated activity detected in Brigade Road corridor` },
  }
  const t = templates[type]
  return { id, type, title: t.title, description: t.description, timestamp: new Date().toISOString() }
}

export default function useLiveSimulation(interval = 15000) {
  const [events, setEvents] = useState([])
  const [isLive, setIsLive] = useState(false)
  const timerRef = useRef(null)
  const countRef = useRef(0)
  const maxEvents = 5

  const start = useCallback(() => {
    if (isLive) return
    setIsLive(true)
    countRef.current = 0
    const fn = () => {
      if (countRef.current >= maxEvents) { stop(); return }
      countRef.current++
      const evt = generateEvent(countRef.current)
      setEvents(prev => [...prev, evt])
    }
    fn()
    timerRef.current = setInterval(fn, interval)
  }, [isLive, interval])

  const stop = useCallback(() => {
    setIsLive(false)
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }, [])

  useEffect(() => { return () => stop() }, [stop])

  return { events, isLive, start, stop }
}
