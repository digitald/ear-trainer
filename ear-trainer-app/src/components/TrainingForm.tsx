import type { Note } from '../domain/intervals'

type IntervalOption = {
  semitone: number
  label: string
}

type TrainingFormProps = {
  directionLabel: string
  ascendingLabel: string
  descendingLabel: string
  direction: 'up' | 'down'
  onDirectionChange: (direction: 'up' | 'down') => void
  baseNoteLabel: string
  baseIndex: number
  notes: Note[]
  onBaseIndexChange: (index: number) => void
  intervalLabel: string
  semitones: number
  intervals: IntervalOption[]
  onSemitonesChange: (value: number) => void
}

export function TrainingForm(props: TrainingFormProps) {
  const {
    directionLabel,
    ascendingLabel,
    descendingLabel,
    direction,
    onDirectionChange,
    baseNoteLabel,
    baseIndex,
    notes,
    onBaseIndexChange,
    intervalLabel,
    semitones,
    intervals,
    onSemitonesChange,
  } = props

  return (
    <section className="card">
      <div className="picker-group">
        <p className="picker-label">{directionLabel}</p>
        <div className="picker-row">
          <button type="button" className={direction === 'up' ? '' : 'secondary'} onClick={() => onDirectionChange('up')}>
            {ascendingLabel}
          </button>
          <button type="button" className={direction === 'down' ? '' : 'secondary'} onClick={() => onDirectionChange('down')}>
            {descendingLabel}
          </button>
        </div>
      </div>

      <div className="picker-group">
        <p className="picker-label">{baseNoteLabel}</p>
        <div className="picker-scroll" role="listbox" aria-label={baseNoteLabel}>
          {notes.map((note, index) => (
            <button
              key={note.name + index}
              type="button"
              className={`chip${baseIndex === index ? ' chip-active' : ''}`}
              onClick={() => onBaseIndexChange(index)}
            >
              {note.name}
            </button>
          ))}
        </div>
      </div>

      <div className="picker-group">
        <p className="picker-label">{intervalLabel}</p>
        <div className="picker-scroll" role="listbox" aria-label={intervalLabel}>
          {intervals.map((interval) => (
            <button
              key={interval.semitone}
              type="button"
              className={`chip${semitones === interval.semitone ? ' chip-active' : ''}`}
              onClick={() => onSemitonesChange(interval.semitone)}
            >
              {interval.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
