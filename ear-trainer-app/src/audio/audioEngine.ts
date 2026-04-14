import { NOTES } from '../domain/intervals'

let audioCtx: AudioContext | null = null
const samples: Record<number, AudioBuffer> = {}
let isLoading = false

const SAMPLE_MAP: Record<number, string> = {
  3: '/piano-mp3_C3.mp3',
  15: '/piano-mp3_C4.mp3',
  27: '/piano-mp3_C5.mp3',
  39: '/piano-mp3_C6.mp3',
}

function ensureContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new window.AudioContext()
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }
  return audioCtx
}

export function initAudioEngine(): void {
  ensureContext()
  void loadSamples()
}

async function loadSamples(): Promise<void> {
  if (isLoading || Object.keys(samples).length > 0) return
  const ctx = ensureContext()
  isLoading = true

  await Promise.all(
    Object.entries(SAMPLE_MAP).map(async ([noteIndex, path]) => {
      try {
        const response = await fetch(path)
        if (!response.ok) return
        const arrayBuffer = await response.arrayBuffer()
        samples[Number(noteIndex)] = await ctx.decodeAudioData(arrayBuffer)
      } catch {
        // Keep oscillator fallback if any sample fails.
      }
    }),
  )

  isLoading = false
}

function playFrequency(freq: number, startTime: number, duration: number): void {
  const ctx = ensureContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = 'triangle'
  oscillator.frequency.value = freq
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(0.25, startTime + 0.03)
  gainNode.gain.setValueAtTime(0.25, startTime + Math.max(0.08, duration - 0.08))
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration)

  oscillator.start(startTime)
  oscillator.stop(startTime + duration + 0.02)
}

function getClosestSampleIndex(targetIndex: number): number | null {
  const loaded = Object.keys(samples).map(Number)
  if (loaded.length === 0) return null

  return loaded.reduce((prev, curr) =>
    Math.abs(curr - targetIndex) < Math.abs(prev - targetIndex) ? curr : prev,
  )
}

function playFromSample(targetIndex: number, startTime: number, duration: number): boolean {
  const ctx = ensureContext()
  const sampleIndex = getClosestSampleIndex(targetIndex)
  if (sampleIndex === null) return false
  const buffer = samples[sampleIndex]
  if (!buffer) return false

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.detune.value = (targetIndex - sampleIndex) * 100

  const gainNode = ctx.createGain()
  source.connect(gainNode)
  gainNode.connect(ctx.destination)

  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(1, startTime + 0.03)
  gainNode.gain.setValueAtTime(1, startTime + Math.max(0.08, duration - 0.08))
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration + 0.12)

  source.start(startTime)
  source.stop(startTime + duration + 0.15)
  return true
}

function playNoteByIndex(targetIndex: number, startTime: number, duration: number): void {
  const samplePlayed = playFromSample(targetIndex, startTime, duration)
  if (!samplePlayed) {
    playFrequency(NOTES[targetIndex].freq, startTime, duration)
  }
}

export function playInterval(index1: number, index2: number): void {
  if (!NOTES[index1] || !NOTES[index2]) return

  initAudioEngine()
  const ctx = ensureContext()
  const now = ctx.currentTime
  playNoteByIndex(index1, now, 0.7)
  playNoteByIndex(index2, now + 0.8, 0.7)
}

export function playMelody(baseIndex: number, sequence: number[], speed = 0.35): void {
  initAudioEngine()
  const ctx = ensureContext()
  const now = ctx.currentTime

  sequence.forEach((semitones, idx) => {
    const targetIndex = baseIndex + semitones
    if (!NOTES[targetIndex]) return
    playNoteByIndex(targetIndex, now + idx * speed, Math.max(0.22, speed * 0.9))
  })
}

export function playSingleNote(noteIndex: number, duration = 0.4): void {
  if (!NOTES[noteIndex]) return
  initAudioEngine()
  const ctx = ensureContext()
  playNoteByIndex(noteIndex, ctx.currentTime, duration)
}

export function playPercussionClick(strong = false): void {
  const ctx = ensureContext()
  const now = ctx.currentTime
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()

  oscillator.type = 'square'
  oscillator.frequency.value = strong ? 1400 : 1000
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(strong ? 0.24 : 0.16, now + 0.003)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)

  oscillator.start(now)
  oscillator.stop(now + 0.055)
}
