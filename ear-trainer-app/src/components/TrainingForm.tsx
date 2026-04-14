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
      <label>
        {directionLabel}
        <select value={direction} onChange={(e) => onDirectionChange(e.target.value as 'up' | 'down')}>
          <option value="up">{ascendingLabel}</option>
          <option value="down">{descendingLabel}</option>
        </select>
      </label>

      <label>
        {baseNoteLabel}
        <select value={baseIndex} onChange={(e) => onBaseIndexChange(Number(e.target.value))}>
          {notes.map((note, index) => (
            <option key={note.name + index} value={index}>
              {note.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        {intervalLabel}
        <select value={semitones} onChange={(e) => onSemitonesChange(Number(e.target.value))}>
          {intervals.map((interval) => (
            <option key={interval.semitone} value={interval.semitone}>
              {interval.label}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
