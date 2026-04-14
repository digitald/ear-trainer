type SingingStaffNote = {
  note: 'C4' | 'D4' | 'E4' | 'F4' | 'G4' | 'A4' | 'B4'
  type: 'quarter' | 'rest'
}

type SingingStaffProps = {
  title: string
  tempo: number
  notes: SingingStaffNote[]
  playheadProgress: number
  showPlayhead: boolean
  highlightedNoteIndex?: number
  countdownValue?: number
  backLabel: string
  tempoLabel: string
  onBack: () => void
}

const NOTE_Y: Record<SingingStaffNote['note'], number> = {
  C4: 101,
  D4: 98,
  E4: 94.5,
  F4: 91,
  G4: 87.5,
  A4: 84,
  B4: 80.5,
}

const SLOT_X = [108, 130, 152, 174, 206, 228, 250, 272]
const MEASURE_SPLIT_X = 192
const STAFF_END_X = 288

function QuarterNote({ x, y, highlighted }: { x: number; y: number; highlighted?: boolean }) {
  return (
    <>
      <ellipse cx={x} cy={y} rx="5.8" ry="4.2" className={highlighted ? 'staff-notehead singing-notehead-active' : 'staff-notehead'} />
      <line x1={x + 4.2} y1={y} x2={x + 4.2} y2={y - 20} className={highlighted ? 'staff-stem singing-stem-active' : 'staff-stem'} />
    </>
  )
}

function QuarterRest({ x, y }: { x: number; y: number }) {
  return (
    <text x={x - 4} y={y} className="singing-rest">
      𝄽
    </text>
  )
}

export function SingingStaff({
  title,
  tempo,
  notes,
  playheadProgress,
  showPlayhead,
  highlightedNoteIndex,
  countdownValue,
  backLabel,
  tempoLabel,
  onBack,
}: SingingStaffProps) {
  const clampedProgress = Math.max(0, Math.min(playheadProgress, 1))
  const playheadX = 100 + clampedProgress * (STAFF_END_X - 100)

  return (
    <section className="card singing-score-card">
      <div className="singing-score-header">
        <button type="button" className="icon-btn secondary" aria-label={backLabel} onClick={onBack}>
          ‹
        </button>
        <h3>{title}</h3>
        <div className="tempo-indicator" aria-label={tempoLabel}>
          <span>⏱</span>
          <span>{`♩ = ${tempo}`}</span>
        </div>
      </div>

      <svg className="singing-svg" viewBox="40 52 320 98" role="img" aria-label={title}>
        {[80, 87, 94, 101, 108].map((y) => (
          <line key={y} x1="50" y1={y} x2={STAFF_END_X} y2={y} className="staff-line" />
        ))}

        <line x1="50" y1="80" x2="50" y2="108" className="staff-bar" />
        <line x1={MEASURE_SPLIT_X} y1="80" x2={MEASURE_SPLIT_X} y2="108" className="staff-bar" />
        <line x1={STAFF_END_X} y1="80" x2={STAFF_END_X} y2="108" className="staff-bar" />

        <text x="58" y="104" className="staff-clef">
          𝄞
        </text>
        <text x="86" y="94" className="staff-time">
          4
        </text>
        <text x="86" y="108" className="staff-time">
          4
        </text>

        {notes.map((item, index) => {
          const x = SLOT_X[index] ?? SLOT_X[SLOT_X.length - 1]
          if (item.type === 'rest') {
            return <QuarterRest key={`rest-${index}`} x={x} y={96} />
          }
          return <QuarterNote key={`${item.note}-${index}`} x={x} y={NOTE_Y[item.note]} highlighted={index === highlightedNoteIndex} />
        })}

        {showPlayhead ? <line x1={playheadX} y1="72" x2={playheadX} y2="116" className="singing-playhead" /> : null}
      </svg>
      {countdownValue ? <div className="singing-countdown">{countdownValue}</div> : null}
    </section>
  )
}

export type { SingingStaffNote }
