import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { initAudioEngine, playInterval, playMelody } from './audio/audioEngine'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { PlaybackControls } from './components/PlaybackControls'
import { TrainingForm } from './components/TrainingForm'
import { INTERVALS, MELODIES, NOTES } from './domain/intervals'

const TOTAL_QUESTIONS = 10

type QuizState = {
  currentInterval: number
  currentBaseIndex: number
  currentTargetIndex: number
  score: number
  questionCount: number
  feedback: string
  isLocked: boolean
  finished: boolean
}

function createRound() {
  const intervalKeys = Object.keys(INTERVALS).map(Number)
  const currentInterval = intervalKeys[Math.floor(Math.random() * intervalKeys.length)]
  const isDescending = Math.random() > 0.5

  if (!isDescending) {
    const maxStart = NOTES.length - currentInterval - 1
    const currentBaseIndex = Math.floor(Math.random() * (maxStart + 1))
    return {
      currentInterval,
      currentBaseIndex,
      currentTargetIndex: currentBaseIndex + currentInterval,
    }
  }

  const minStart = currentInterval
  const currentBaseIndex = Math.floor(Math.random() * (NOTES.length - minStart)) + minStart
  return {
    currentInterval,
    currentBaseIndex,
    currentTargetIndex: currentBaseIndex - currentInterval,
  }
}

function quizInitialState(): QuizState {
  const round = createRound()
  return {
    ...round,
    score: 0,
    questionCount: 0,
    feedback: '',
    isLocked: false,
    finished: false,
  }
}

function App() {
  const { t, i18n } = useTranslation()
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [mode, setMode] = useState<'training' | 'quiz'>('training')
  const [baseIndex, setBaseIndex] = useState(3)
  const [semitones, setSemitones] = useState(7)
  const [direction, setDirection] = useState<'up' | 'down'>('up')
  const [feedback, setFeedback] = useState('')
  const [quizState, setQuizState] = useState<QuizState>(quizInitialState)

  const language = i18n.language.startsWith('it') ? 'it' : 'en'
  const intervalOptions = useMemo(
    () =>
      Object.entries(INTERVALS).map(([step, key]) => ({
        semitone: Number(step),
        label: t(`intervals.${key}`),
      })),
    [t],
  )
  const targetIndex = useMemo(
    () => baseIndex + (direction === 'down' ? -semitones : semitones),
    [baseIndex, direction, semitones],
  )

  const quizResultMessage = useMemo(() => {
    if (quizState.score === TOTAL_QUESTIONS) return t('quiz.resultPerfect')
    if (quizState.score >= 8) return t('quiz.resultGreat')
    if (quizState.score >= 5) return t('quiz.resultGood')
    return t('quiz.resultPractice')
  }, [quizState.score, t])

  const isRangeValid = targetIndex >= 0 && targetIndex < NOTES.length

  const onPlayInterval = () => {
    initAudioEngine()
    if (!isRangeValid) {
      setFeedback(t('outOfRange'))
      return
    }
    setFeedback('')
    playInterval(baseIndex, targetIndex)
  }

  const onPlayHint = () => {
    initAudioEngine()
    const melody = MELODIES[semitones]
    if (!melody) {
      setFeedback(t('noMelody'))
      return
    }
    setFeedback(`${t('feedbackPrefix')}: ${t(`melodies.${melody.key}`)}`)
    playMelody(baseIndex, melody.sequence, melody.rhythm)
  }

  const startQuiz = () => {
    const state = quizInitialState()
    setQuizState(state)
    initAudioEngine()
    playInterval(state.currentBaseIndex, state.currentTargetIndex)
  }

  const playQuizHint = () => {
    if (quizState.isLocked || quizState.finished) return
    const melody = MELODIES[quizState.currentInterval]
    if (!melody) {
      setQuizState((prev) => ({ ...prev, feedback: t('noMelody') }))
      return
    }
    setQuizState((prev) => ({
      ...prev,
      feedback: `${t('feedbackPrefix')}: ${t(`melodies.${melody.key}`)}`,
    }))
    playMelody(quizState.currentBaseIndex, melody.sequence, melody.rhythm)
  }

  const replayQuizInterval = () => {
    if (quizState.isLocked || quizState.finished) return
    playInterval(quizState.currentBaseIndex, quizState.currentTargetIndex)
  }

  const handleQuizAnswer = (guess: number) => {
    if (quizState.isLocked || quizState.finished) return
    const isCorrect = guess === quizState.currentInterval
    const nextScore = isCorrect ? quizState.score + 1 : quizState.score
    const nextQuestion = quizState.questionCount + 1

    setQuizState((prev) => ({
      ...prev,
      score: nextScore,
      questionCount: nextQuestion,
      feedback: isCorrect
        ? t('quiz.correct')
        : `${t('quiz.wrong')}: ${t(`intervals.${INTERVALS[quizState.currentInterval]}`)}`,
      isLocked: true,
    }))

    window.setTimeout(() => {
      if (nextQuestion >= TOTAL_QUESTIONS) {
        setQuizState((prev) => ({ ...prev, finished: true, isLocked: false }))
        return
      }

      const nextRound = createRound()
      setQuizState((prev) => ({
        ...prev,
        ...nextRound,
        isLocked: false,
        feedback: t('quiz.listen'),
      }))
      playInterval(nextRound.currentBaseIndex, nextRound.currentTargetIndex)
    }, 1200)
  }

  if (!isOnboarded) {
    return (
      <main className="app-shell">
        <section className="card-glass onboarding">
          <h1>{t('onboarding.title')}</h1>
          <p>{t('onboarding.subtitle')}</p>
          <LanguageSwitcher
            value={language}
            label={t('language')}
            onChange={(selectedLanguage) => {
              void i18n.changeLanguage(selectedLanguage)
            }}
          />
          <ul className="onboarding-list">
            <li>{t('onboarding.step1')}</li>
            <li>{t('onboarding.step2')}</li>
            <li>{t('onboarding.step3')}</li>
          </ul>
          <button type="button" onClick={() => setIsOnboarded(true)}>
            {t('onboarding.start')}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="app-header card-glass">
        <div className="title-wrap">
          <h1>{t('title')}</h1>
          <p>{t('subtitle')}</p>
          {mode === 'training' ? (
            <div className="pill-row">
              <span className="pill">{NOTES[baseIndex].name}</span>
              <span className="pill">
                {direction === 'up' ? '↑' : '↓'} {intervalOptions.find((item) => item.semitone === semitones)?.label}
              </span>
            </div>
          ) : (
            <div className="pill-row">
              <span className="pill">
                {t('quiz.question')}: {Math.min(quizState.questionCount + 1, TOTAL_QUESTIONS)}/{TOTAL_QUESTIONS}
              </span>
              <span className="pill">
                {t('quiz.score')}: {quizState.score}
              </span>
            </div>
          )}
        </div>
        <LanguageSwitcher
          value={language}
          label={t('language')}
          onChange={(selectedLanguage) => {
            void i18n.changeLanguage(selectedLanguage)
          }}
        />
      </header>

      <div className="mode-switch card">
        <button type="button" className={mode === 'training' ? '' : 'secondary'} onClick={() => setMode('training')}>
          {t('tabs.training')}
        </button>
        <button
          type="button"
          className={mode === 'quiz' ? '' : 'secondary'}
          onClick={() => {
            setMode('quiz')
            startQuiz()
          }}
        >
          {t('tabs.quiz')}
        </button>
      </div>

      {mode === 'training' ? (
        <>
          <TrainingForm
            directionLabel={t('direction')}
            ascendingLabel={t('ascending')}
            descendingLabel={t('descending')}
            direction={direction}
            onDirectionChange={setDirection}
            baseNoteLabel={t('baseNote')}
            baseIndex={baseIndex}
            notes={NOTES}
            onBaseIndexChange={setBaseIndex}
            intervalLabel={t('interval')}
            semitones={semitones}
            intervals={intervalOptions}
            onSemitonesChange={setSemitones}
          />

          <div className="card card-actions">
            <PlaybackControls
              playIntervalLabel={t('playInterval')}
              playHintLabel={t('playHint')}
              onPlayInterval={onPlayInterval}
              onPlayHint={onPlayHint}
            />
          </div>

          {feedback ? <p className="feedback">{feedback}</p> : null}
        </>
      ) : (
        <>
          {!quizState.finished ? (
            <>
              <div className="card card-actions">
                <PlaybackControls
                  playIntervalLabel={t('quiz.replay')}
                  playHintLabel={t('playHint')}
                  onPlayInterval={replayQuizInterval}
                  onPlayHint={playQuizHint}
                />
              </div>
              <section className="card quiz-grid">
                {intervalOptions.map((option) => (
                  <button
                    key={option.semitone}
                    type="button"
                    className="secondary"
                    disabled={quizState.isLocked}
                    onClick={() => handleQuizAnswer(option.semitone)}
                  >
                    {option.label}
                  </button>
                ))}
              </section>
            </>
          ) : (
            <section className="card result-card">
              <h2>{t('quiz.finished')}</h2>
              <p>
                {quizState.score} / {TOTAL_QUESTIONS}
              </p>
              <p>{quizResultMessage}</p>
              <button type="button" onClick={startQuiz}>
                {t('quiz.restart')}
              </button>
            </section>
          )}
          {quizState.feedback ? <p className="feedback">{quizState.feedback}</p> : <p className="feedback">{t('quiz.listen')}</p>}
        </>
      )}
    </main>
  )
}

export default App
