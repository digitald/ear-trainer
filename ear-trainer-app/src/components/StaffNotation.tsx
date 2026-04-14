type Clef = 'treble' | 'bass'

type StaffNotationProps = {
  clef: Clef
  noteNames: [string, string]
  title: string
}

const LETTER_INDEX: Record<string, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
}

const SOLFEGE_TO_LETTER: Record<string, string> = {
  Do: 'C',
  Re: 'D',
  Mi: 'E',
  Fa: 'F',
  Sol: 'G',
  La: 'A',
  Si: 'B',
}

function parseNoteName(rawName: string) {
  const withSolfege = rawName.match(/^(Do|Re|Mi|Fa|Sol|La|Si)(#?)(\d)$/)
  if (withSolfege) {
    return {
      letter: SOLFEGE_TO_LETTER[withSolfege[1]],
      accidental: withSolfege[2],
      octave: Number(withSolfege[3]),
    }
  }

  const withLetter = rawName.match(/^([A-G])(#?)(\d)$/)
  if (withLetter) {
    return {
      letter: withLetter[1],
      accidental: withLetter[2],
      octave: Number(withLetter[3]),
    }
  }

  return { letter: 'C', accidental: '', octave: 4 }
}

function getDiatonicIndex(letter: string, octave: number): number {
  return octave * 7 + LETTER_INDEX[letter]
}

function getRawNoteY(rawName: string, clef: Clef): number {
  const bottomLineY = 108
  const stepY = 3.5
  const { letter, octave } = parseNoteName(rawName)
  const noteIndex = getDiatonicIndex(letter, octave)
  const refIndex = clef === 'treble' ? getDiatonicIndex('E', 4) : getDiatonicIndex('G', 2)
  return bottomLineY - (noteIndex - refIndex) * stepY
}

function normalizeWithShift(rawY: number, shift: number) {
  const octaveShiftY = 24.5
  return rawY + shift * octaveShiftY
}

function computeGlobalOctaveShift(rawYValues: number[]) {
  const upper = 73
  const lower = 115
  const octaveShiftY = 24.5
  let shift = 0
  let center = rawYValues.reduce((sum, y) => sum + y, 0) / rawYValues.length

  while (center < upper) {
    center += octaveShiftY
    shift += 1
  }
  while (center > lower) {
    center -= octaveShiftY
    shift -= 1
  }

  return shift
}

function getAccidental(rawName: string): string {
  return parseNoteName(rawName).accidental
}

function getLedgerLines(y: number): number[] {
  const lines: number[] = []
  const topLineY = 80
  const bottomLineY = 108
  const lineStep = 7

  for (let ledgerY = topLineY - lineStep; y <= ledgerY; ledgerY -= lineStep) {
    lines.push(ledgerY)
  }

  for (let ledgerY = bottomLineY + lineStep; y >= ledgerY; ledgerY += lineStep) {
    lines.push(ledgerY)
  }

  return lines
}

function HalfRest({ x, y }: { x: number; y: number }) {
  return <rect x={x - 7} y={y - 4} width="14" height="4" className="staff-rest-block" />
}

export function StaffNotation({ clef, noteNames, title }: StaffNotationProps) {
  const rawFirstY = getRawNoteY(noteNames[0], clef)
  const rawSecondY = getRawNoteY(noteNames[1], clef)
  // Apply one global octave shift to both notes to preserve interval direction.
  const globalShift = computeGlobalOctaveShift([rawFirstY, rawSecondY])
  const firstY = normalizeWithShift(rawFirstY, globalShift)
  const secondY = normalizeWithShift(rawSecondY, globalShift)
  const octaveHintDirection = globalShift > 0 ? 1 : globalShift < 0 ? -1 : 0

  const firstAccidental = getAccidental(noteNames[0])
  const secondAccidental = getAccidental(noteNames[1])
  const firstLedger = getLedgerLines(firstY)
  const secondLedger = getLedgerLines(secondY)

  // Single-bar layout in 4/4:
  // two quarter notes + one half rest.
  const firstX = 116
  const secondX = 138
  const halfRestX = 170
  const measureEndX = 220
  const stemOffsetX = 4.2
  const stemLength = 20

  return (
    <section className="card staff-card">
      <h3>{title}</h3>
      <svg className="staff-svg" viewBox="40 56 200 88" role="img" aria-label={title}>
        {[80, 87, 94, 101, 108].map((y) => (
          <line key={y} x1="50" y1={y} x2={measureEndX} y2={y} className="staff-line" />
        ))}

        <line x1="50" y1="80" x2="50" y2="108" className="staff-bar" />
        <line x1={measureEndX} y1="80" x2={measureEndX} y2="108" className="staff-bar" />

        <text x="60" y="104" className="staff-clef">
          {clef === 'treble' ? '𝄞' : '𝄢'}
        </text>
        <text x="88" y="94" className="staff-time">
          4
        </text>
        <text x="88" y="108" className="staff-time">
          4
        </text>

        {octaveHintDirection !== 0 ? (
          <g className="staff-ottava-mark">
            <text x="112" y={octaveHintDirection > 0 ? 63 : 132} className="staff-octave-mark">
              {octaveHintDirection > 0 ? '8va' : '8vb'}
            </text>
            <line
              x1="136"
              y1={octaveHintDirection > 0 ? 60 : 128}
              x2={measureEndX - 8}
              y2={octaveHintDirection > 0 ? 60 : 128}
              className="staff-ottava-line"
            />
            <line
              x1={measureEndX - 8}
              y1={octaveHintDirection > 0 ? 60 : 128}
              x2={measureEndX - 8}
              y2={octaveHintDirection > 0 ? 68 : 120}
              className="staff-ottava-line"
            />
          </g>
        ) : null}

        <HalfRest x={halfRestX} y={94} />

        {firstLedger.map((ledgerY) => (
          <line key={`first-${ledgerY}`} x1={firstX - 12} y1={ledgerY} x2={firstX + 12} y2={ledgerY} className="staff-ledger" />
        ))}
        {secondLedger.map((ledgerY) => (
          <line
            key={`second-${ledgerY}`}
            x1={secondX - 12}
            y1={ledgerY}
            x2={secondX + 12}
            y2={ledgerY}
            className="staff-ledger"
          />
        ))}

        {firstAccidental ? (
          <text x={firstX - 17} y={firstY + 4} className="staff-accidental">
            {firstAccidental}
          </text>
        ) : null}
        <ellipse cx={firstX} cy={firstY} rx="5.8" ry="4.2" className="staff-notehead" />
        <line
          x1={firstX + stemOffsetX}
          y1={firstY}
          x2={firstX + stemOffsetX}
          y2={firstY - stemLength}
          className="staff-stem"
        />

        {secondAccidental ? (
          <text x={secondX - 17} y={secondY + 4} className="staff-accidental">
            {secondAccidental}
          </text>
        ) : null}
        <ellipse cx={secondX} cy={secondY} rx="5.8" ry="4.2" className="staff-notehead" />
        <line
          x1={secondX + stemOffsetX}
          y1={secondY}
          x2={secondX + stemOffsetX}
          y2={secondY - stemLength}
          className="staff-stem"
        />
      </svg>
    </section>
  )
}
