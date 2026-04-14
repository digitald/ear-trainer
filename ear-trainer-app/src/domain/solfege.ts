import type { SingingStaffNote } from '../components/SingingStaff'

type SolfegeExercise = {
  id: string
  tempo: number
  tonicNoteIndex: number
  notes: SingingStaffNote[]
}

type SolfegeLevel = {
  id: string
  titleKey: string
  exercises: SolfegeExercise[]
}

const SOLFEGE_LEVELS: SolfegeLevel[] = [
  {
    id: 'level-1',
    titleKey: 'solfege.level1Title',
    exercises: [
      {
        id: 'level-1-a',
        tempo: 80,
        tonicNoteIndex: 15,
        notes: [
          { note: 'C4', type: 'quarter' },
          { note: 'D4', type: 'quarter' },
          { note: 'E4', type: 'quarter' },
          { note: 'F4', type: 'quarter' },
          { note: 'G4', type: 'quarter' },
          { note: 'E4', type: 'quarter' },
          { note: 'C4', type: 'quarter' },
          { note: 'C4', type: 'rest' },
        ],
      },
      {
        id: 'level-1-b',
        tempo: 84,
        tonicNoteIndex: 17,
        notes: [
          { note: 'D4', type: 'quarter' },
          { note: 'E4', type: 'quarter' },
          { note: 'F4', type: 'quarter' },
          { note: 'G4', type: 'quarter' },
          { note: 'F4', type: 'quarter' },
          { note: 'E4', type: 'quarter' },
          { note: 'D4', type: 'quarter' },
          { note: 'D4', type: 'rest' },
        ],
      },
    ],
  },
  {
    id: 'level-2',
    titleKey: 'solfege.level2Title',
    exercises: [
      {
        id: 'level-2-a',
        tempo: 76,
        tonicNoteIndex: 15,
        notes: [
          { note: 'C4', type: 'quarter' },
          { note: 'E4', type: 'quarter' },
          { note: 'D4', type: 'quarter' },
          { note: 'F4', type: 'quarter' },
          { note: 'E4', type: 'quarter' },
          { note: 'G4', type: 'quarter' },
          { note: 'E4', type: 'quarter' },
          { note: 'C4', type: 'rest' },
        ],
      },
      {
        id: 'level-2-b',
        tempo: 80,
        tonicNoteIndex: 17,
        notes: [
          { note: 'D4', type: 'quarter' },
          { note: 'F4', type: 'quarter' },
          { note: 'E4', type: 'quarter' },
          { note: 'G4', type: 'quarter' },
          { note: 'F4', type: 'quarter' },
          { note: 'D4', type: 'quarter' },
          { note: 'E4', type: 'quarter' },
          { note: 'D4', type: 'rest' },
        ],
      },
    ],
  },
]

export { SOLFEGE_LEVELS }
export type { SolfegeExercise, SolfegeLevel }
