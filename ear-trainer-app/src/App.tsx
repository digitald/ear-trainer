import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { initAudioEngine, playInterval, playMelody, playPercussionClick, playSingleNote } from './audio/audioEngine'
import logoEarTrainer from './assets/logo-ear-trainer.png'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { PlaybackControls } from './components/PlaybackControls'
import { SingingControls, type SingingStatus } from './components/SingingControls'
import { SingingStaff } from './components/SingingStaff'
import { StaffNotation } from './components/StaffNotation'
import { TrainingForm } from './components/TrainingForm'
import { SOLFEGE_LEVELS } from './domain/solfege'
import { INTERVALS, MELODIES, NOTES } from './domain/intervals'

const TOTAL_QUESTIONS = 10
const STORAGE_KEYS = {
  onboardingSeen: 'earTrainer.onboardingSeen',
  mode: 'earTrainer.mode',
  baseIndex: 'earTrainer.baseIndex',
  semitones: 'earTrainer.semitones',
  direction: 'earTrainer.direction',
  clef: 'earTrainer.clef',
  quizHighScore: 'earTrainer.quizHighScore',
}

const SOLFEGE_NOTE_TO_INDEX = {
  C4: 15,
  D4: 17,
  E4: 19,
  F4: 20,
  G4: 22,
  A4: 24,
  B4: 26,
} as const

type QuizState = {
  currentInterval: number
  currentBaseIndex: number
  currentTargetIndex: number
  score: number
  questionCount: number
  feedback: string
  isLocked: boolean
  finished: boolean
  selectedGuess: number | null
  revealCorrect: boolean
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
    selectedGuess: null,
    revealCorrect: false,
  }
}

function readNumberStorage(key: string, fallback: number): number {
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

function triggerHaptic(pattern: 'light' | 'success' | 'error' = 'light') {
  if (!('vibrate' in navigator)) return
  if (pattern === 'success') {
    navigator.vibrate([14, 16, 20])
    return
  }
  if (pattern === 'error') {
    navigator.vibrate([22, 18, 22])
    return
  }
  navigator.vibrate(10)
}

function App() {
  const { t, i18n } = useTranslation()
  const [isOnboarded, setIsOnboarded] = useState(() => window.localStorage.getItem(STORAGE_KEYS.onboardingSeen) === '1')
  const [mode, setMode] = useState<'training' | 'quiz' | 'solfege' | 'settings'>(() =>
    window.localStorage.getItem(STORAGE_KEYS.mode) === 'quiz'
      ? 'quiz'
      : window.localStorage.getItem(STORAGE_KEYS.mode) === 'solfege'
        ? 'solfege'
      : window.localStorage.getItem(STORAGE_KEYS.mode) === 'settings'
        ? 'settings'
        : 'training',
  )
  const [baseIndex, setBaseIndex] = useState(() => readNumberStorage(STORAGE_KEYS.baseIndex, 3))
  const [semitones, setSemitones] = useState(() => readNumberStorage(STORAGE_KEYS.semitones, 7))
  const [direction, setDirection] = useState<'up' | 'down'>(() =>
    window.localStorage.getItem(STORAGE_KEYS.direction) === 'down' ? 'down' : 'up',
  )
  const [feedback, setFeedback] = useState('')
  const [clef, setClef] = useState<'treble' | 'bass'>(() =>
    window.localStorage.getItem(STORAGE_KEYS.clef) === 'bass' ? 'bass' : 'treble',
  )
  const [quizState, setQuizState] = useState<QuizState>(quizInitialState)
  const [showQuizStaff, setShowQuizStaff] = useState(false)
  const [highScore, setHighScore] = useState(() => readNumberStorage(STORAGE_KEYS.quizHighScore, 0))
  const [solfegeLevelIndex, setSolfegeLevelIndex] = useState(0)
  const [solfegeAttemptIndex, setSolfegeAttemptIndex] = useState(0)
  const [solfegeBanner, setSolfegeBanner] = useState('')
  const [singingStatus, setSingingStatus] = useState<SingingStatus>('ready')
  const [playheadProgress, setPlayheadProgress] = useState(0)
  const [isSolfeggioGuidePlayback, setIsSolfeggioGuidePlayback] = useState(false)
  const [countdownValue, setCountdownValue] = useState<number | null>(null)
  const [highlightedNoteIndex, setHighlightedNoteIndex] = useState<number | undefined>(undefined)
  const solfegeTimersRef = useRef<number[]>([])

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
  const clampedTargetIndex = useMemo(() => Math.max(0, Math.min(targetIndex, NOTES.length - 1)), [targetIndex])

  const quizResultMessage = useMemo(() => {
    if (quizState.score === TOTAL_QUESTIONS) return t('quiz.resultPerfect')
    if (quizState.score >= 8) return t('quiz.resultGreat')
    if (quizState.score >= 5) return t('quiz.resultGood')
    return t('quiz.resultPractice')
  }, [quizState.score, t])
  const currentSolfegeLevel = SOLFEGE_LEVELS[solfegeLevelIndex] ?? SOLFEGE_LEVELS[0]
  const currentSolfeggioExercise =
    currentSolfegeLevel.exercises[solfegeAttemptIndex] ?? currentSolfegeLevel.exercises[0]

  const isRangeValid = targetIndex >= 0 && targetIndex < NOTES.length
  const isSolfeggioRecording = mode === 'solfege' && singingStatus === 'recording'
  const showSolfeggioPlayhead = isSolfeggioRecording || isSolfeggioGuidePlayback

  const clearSolfeggioTimers = () => {
    solfegeTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    solfegeTimersRef.current = []
  }

  useEffect(() => {
    if (!isSolfeggioRecording) return

    const durationMs = 6200
    const startedAt = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      const nextProgress = Math.min(elapsed / durationMs, 1)
      setPlayheadProgress(nextProgress)
      if (nextProgress >= 1) {
        window.clearInterval(timer)
        setSingingStatus('review')
      }
    }, 80)

    return () => window.clearInterval(timer)
  }, [isSolfeggioRecording])

  useEffect(() => {
    return () => {
      clearSolfeggioTimers()
    }
  }, [])

  useEffect(() => {
    if (!isSolfeggioGuidePlayback) return

    const beatMs = (60_000 / currentSolfeggioExercise.tempo)
    const durationMs = beatMs * currentSolfeggioExercise.notes.length
    const startedAt = performance.now()
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - startedAt
      const nextProgress = Math.min(elapsed / durationMs, 1)
      setPlayheadProgress(nextProgress)
      if (nextProgress >= 1) {
        window.clearInterval(timer)
        setIsSolfeggioGuidePlayback(false)
        setPlayheadProgress(0)
        setHighlightedNoteIndex(undefined)
      }
    }, 80)

    return () => window.clearInterval(timer)
  }, [currentSolfeggioExercise.notes.length, currentSolfeggioExercise.tempo, isSolfeggioGuidePlayback])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.onboardingSeen, isOnboarded ? '1' : '0')
  }, [isOnboarded])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.mode, mode)
  }, [mode])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.baseIndex, String(baseIndex))
    window.localStorage.setItem(STORAGE_KEYS.semitones, String(semitones))
    window.localStorage.setItem(STORAGE_KEYS.direction, direction)
  }, [baseIndex, semitones, direction])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEYS.clef, clef)
  }, [clef])

  const onPlayInterval = () => {
    triggerHaptic('light')
    initAudioEngine()
    if (!isRangeValid) {
      setFeedback(t('outOfRange'))
      return
    }
    setFeedback('')
    playInterval(baseIndex, targetIndex)
  }

  const onPlayHint = () => {
    triggerHaptic('light')
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
    triggerHaptic('light')
    const state = quizInitialState()
    setQuizState(state)
    setShowQuizStaff(false)
    initAudioEngine()
    playInterval(state.currentBaseIndex, state.currentTargetIndex)
  }

  const playQuizHint = () => {
    if (quizState.isLocked || quizState.finished) return
    triggerHaptic('light')
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
    triggerHaptic('light')
    playInterval(quizState.currentBaseIndex, quizState.currentTargetIndex)
  }

  const handleQuizAnswer = (guess: number) => {
    if (quizState.isLocked || quizState.finished) return
    const isCorrect = guess === quizState.currentInterval
    triggerHaptic(isCorrect ? 'success' : 'error')
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
      selectedGuess: guess,
      revealCorrect: true,
    }))

    window.setTimeout(() => {
      if (nextQuestion >= TOTAL_QUESTIONS) {
        if (nextScore > highScore) {
          setHighScore(nextScore)
          window.localStorage.setItem(STORAGE_KEYS.quizHighScore, String(nextScore))
        }
        setQuizState((prev) => ({ ...prev, finished: true, isLocked: false }))
        return
      }

      const nextRound = createRound()
      setQuizState((prev) => ({
        ...prev,
        ...nextRound,
        isLocked: false,
        feedback: t('quiz.listen'),
        selectedGuess: null,
        revealCorrect: false,
      }))
      setShowQuizStaff(false)
      playInterval(nextRound.currentBaseIndex, nextRound.currentTargetIndex)
    }, 1200)
  }

  const startSolfeggio = () => {
    triggerHaptic('light')
    setSolfegeBanner('')
    clearSolfeggioTimers()
    setIsSolfeggioGuidePlayback(false)
    setPlayheadProgress(0)
    setSingingStatus('preparing')
    setHighlightedNoteIndex(0)
    setCountdownValue(null)
    initAudioEngine()
    playSingleNote(currentSolfeggioExercise.tonicNoteIndex, 2.9)
    const beatMs = 60_000 / currentSolfeggioExercise.tempo

    const countdownStart = window.setTimeout(() => {
      setHighlightedNoteIndex(undefined)
      ;[4, 3, 2, 1].forEach((value, idx) => {
        const beatTimer = window.setTimeout(() => {
          setCountdownValue(value)
          playPercussionClick(value === 4)
        }, idx * beatMs)
        solfegeTimersRef.current.push(beatTimer)
      })
    }, 3000)

    const recordingStart = window.setTimeout(() => {
      setCountdownValue(null)
      setPlayheadProgress(0)
      setSingingStatus('recording')
    }, 3000 + 4 * beatMs)

    solfegeTimersRef.current.push(countdownStart, recordingStart)
  }

  const stopSolfeggio = () => {
    triggerHaptic('light')
    clearSolfeggioTimers()
    setIsSolfeggioGuidePlayback(false)
    setCountdownValue(null)
    setHighlightedNoteIndex(undefined)
    setSingingStatus('review')
  }

  const retrySolfeggio = () => {
    triggerHaptic('light')
    setSolfegeBanner('')
    clearSolfeggioTimers()
    setIsSolfeggioGuidePlayback(false)
    setPlayheadProgress(0)
    setCountdownValue(null)
    setHighlightedNoteIndex(undefined)
    setSingingStatus('ready')
  }

  const nextSolfeggio = () => {
    triggerHaptic('light')
    clearSolfeggioTimers()
    setIsSolfeggioGuidePlayback(false)
    setPlayheadProgress(0)
    setCountdownValue(null)
    setHighlightedNoteIndex(undefined)
    setSingingStatus('ready')
    const attemptsInLevel = currentSolfegeLevel.exercises.length
    if (solfegeAttemptIndex < attemptsInLevel - 1) {
      setSolfegeBanner('')
      setSolfegeAttemptIndex((prev) => prev + 1)
      return
    }
    setSolfegeBanner(t('solfege.levelCompleted'))
    setSolfegeAttemptIndex(0)
    setSolfegeLevelIndex((prev) => (prev + 1) % SOLFEGE_LEVELS.length)
  }

  const replaySolfeggio = () => {
    if (singingStatus !== 'review' || isSolfeggioGuidePlayback) return
    triggerHaptic('light')
    clearSolfeggioTimers()
    setCountdownValue(null)
    setPlayheadProgress(0)
    setIsSolfeggioGuidePlayback(true)

    const beatMs = 60_000 / currentSolfeggioExercise.tempo
    currentSolfeggioExercise.notes.forEach((item, index) => {
      const beatTimer = window.setTimeout(() => {
        setHighlightedNoteIndex(item.type === 'quarter' ? index : undefined)
        if (item.type === 'quarter') {
          playSingleNote(SOLFEGE_NOTE_TO_INDEX[item.note], Math.min(0.42, (beatMs / 1000) * 0.8))
        } else {
          playPercussionClick()
        }
      }, index * beatMs)
      solfegeTimersRef.current.push(beatTimer)
    })
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
          <div className="brand-row">
            <img className="brand-logo" src={logoEarTrainer} alt="Ear Trainer logo" />
            <h1 className="brand-title">{t('title')}</h1>
          </div>
          <p className="brand-subtitle">{t('subtitle')}</p>
          {mode === 'training' ? (
            <div className="pill-row">
              <span className="pill">{NOTES[baseIndex].name}</span>
              <span className="pill">
                {direction === 'up' ? '↑' : '↓'} {intervalOptions.find((item) => item.semitone === semitones)?.label}
              </span>
            </div>
          ) : mode === 'solfege' ? (
            <div className="pill-row">
              <span className="pill">{t(currentSolfegeLevel.titleKey)}</span>
              <span className="pill">
                {t('solfege.attempt')}: {solfegeAttemptIndex + 1}/{currentSolfegeLevel.exercises.length}
              </span>
              <span className="pill">{`♩= ${currentSolfeggioExercise.tempo}`}</span>
            </div>
          ) : (
            <div className="pill-row">
              <span className="pill">
                {t('quiz.question')}: {Math.min(quizState.questionCount + 1, TOTAL_QUESTIONS)}/{TOTAL_QUESTIONS}
              </span>
              <span className="pill">
                {t('quiz.score')}: {quizState.score}
              </span>
              <span className="pill">
                {t('quiz.highScore')}: {highScore}
              </span>
            </div>
          )}
        </div>
        <LanguageSwitcher
          value={language}
          label={t('language')}
          onChange={(selectedLanguage) => {
            triggerHaptic('light')
            void i18n.changeLanguage(selectedLanguage)
          }}
        />
      </header>

      <div className="content-area">
      {mode !== 'solfege' ? (
        <div className="card clef-controls">
          <p className="clef-label">{t('staff.clef')}</p>
          <div className="clef-toggle" role="group" aria-label={t('staff.clef')}>
            <button
              type="button"
              className={clef === 'treble' ? '' : 'secondary'}
              onClick={() => {
                triggerHaptic('light')
                setClef('treble')
              }}
              aria-label={t('staff.treble')}
              title={t('staff.treble')}
            >
              𝄞
            </button>
            <button
              type="button"
              className={clef === 'bass' ? '' : 'secondary'}
              onClick={() => {
                triggerHaptic('light')
                setClef('bass')
              }}
              aria-label={t('staff.bass')}
              title={t('staff.bass')}
            >
              𝄢
            </button>
          </div>
        </div>
      ) : null}

      {mode === 'training' ? (
        <StaffNotation
          clef={clef}
          noteNames={[NOTES[baseIndex].name, NOTES[clampedTargetIndex].name]}
          title={t('staff.title')}
        />
      ) : null}

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
      ) : mode === 'quiz' ? (
        <>
          {!quizState.finished ? (
            <>
              <div className="card card-actions">
                <section className="actions">
                  <button type="button" onClick={replayQuizInterval}>
                    {t('quiz.replay')}
                  </button>
                  <button type="button" className="secondary" onClick={playQuizHint}>
                    {t('playHint')}
                  </button>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => {
                      triggerHaptic('light')
                      setShowQuizStaff((prev) => !prev)
                    }}
                  >
                    {showQuizStaff ? t('staff.hideScore') : t('staff.showScore')}
                  </button>
                </section>
              </div>
              {showQuizStaff ? (
                <StaffNotation
                  clef={clef}
                  noteNames={[NOTES[quizState.currentBaseIndex].name, NOTES[quizState.currentTargetIndex].name]}
                  title={t('staff.title')}
                />
              ) : null}
              <section className="card quiz-grid">
                {intervalOptions.map((option) => (
                  <button
                    key={option.semitone}
                    type="button"
                    className={`secondary quiz-answer${
                      quizState.revealCorrect && option.semitone === quizState.currentInterval
                        ? ' quiz-answer-correct'
                        : ''
                    }${
                      quizState.revealCorrect &&
                      quizState.selectedGuess === option.semitone &&
                      option.semitone !== quizState.currentInterval
                        ? ' quiz-answer-wrong'
                        : ''
                    }`}
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
              <p>
                {t('quiz.highScore')}: {highScore}
              </p>
              <button type="button" onClick={startQuiz}>
                {t('quiz.restart')}
              </button>
            </section>
          )}
          {quizState.feedback ? (
            <p className="feedback" role="status" aria-live="polite">
              {quizState.feedback}
            </p>
          ) : (
            <p className="feedback" role="status" aria-live="polite">
              {t('quiz.listen')}
            </p>
          )}
        </>
      ) : mode === 'solfege' ? (
        <>
          <SingingStaff
            title={t(currentSolfegeLevel.titleKey)}
            tempo={currentSolfeggioExercise.tempo}
            notes={currentSolfeggioExercise.notes}
            playheadProgress={playheadProgress}
            backLabel={t('solfege.back')}
            tempoLabel={t('solfege.tempo')}
            onBack={() => {
              triggerHaptic('light')
              clearSolfeggioTimers()
              setMode('training')
              setSingingStatus('ready')
              setIsSolfeggioGuidePlayback(false)
              setPlayheadProgress(0)
              setCountdownValue(null)
              setHighlightedNoteIndex(undefined)
            }}
            showPlayhead={showSolfeggioPlayhead}
            highlightedNoteIndex={highlightedNoteIndex}
            countdownValue={countdownValue ?? undefined}
          />
          {solfegeBanner ? <p className="feedback">{solfegeBanner}</p> : null}
          <SingingControls
            status={singingStatus}
            readyText={t('solfege.ready')}
            preparingText={t('solfege.preparing')}
            recordingText={t('solfege.recording')}
            reviewText={t('solfege.review')}
            retryLabel={t('solfege.retry')}
            nextLabel={t('solfege.next')}
            replayLabel={t('solfege.replay')}
            onStart={startSolfeggio}
            onStop={stopSolfeggio}
            onRetry={retrySolfeggio}
            onNext={nextSolfeggio}
            onReplay={replaySolfeggio}
            replayDisabled={isSolfeggioGuidePlayback}
          />
        </>
      ) : (
        <section className="card settings-card">
          <h2>{t('settings.title')}</h2>
          <div className="profile-chip">
            <span className="profile-avatar">♪</span>
            <div>
              <strong>{t('settings.profileTitle')}</strong>
              <p>{t('settings.profileSubtitle')}</p>
            </div>
          </div>
          <LanguageSwitcher
            value={language}
            label={t('language')}
            onChange={(selectedLanguage) => {
              triggerHaptic('light')
              void i18n.changeLanguage(selectedLanguage)
            }}
          />
        </section>
      )}
      </div>

      <nav className="bottom-nav card-glass" aria-label={t('tabs.navigation')}>
        <button
          type="button"
          className={mode === 'training' ? '' : 'secondary'}
          onClick={() => {
            triggerHaptic('light')
            setMode('training')
          }}
        >
          🎧 {t('tabs.training')}
        </button>
        <button
          type="button"
          className={mode === 'quiz' ? '' : 'secondary'}
          onClick={() => {
            triggerHaptic('light')
            setMode('quiz')
            startQuiz()
          }}
        >
          🎮 {t('tabs.quiz')}
        </button>
        <button
          type="button"
          className={mode === 'solfege' ? '' : 'secondary'}
          onClick={() => {
            triggerHaptic('light')
            setMode('solfege')
            setPlayheadProgress(0)
            setSingingStatus('ready')
          }}
        >
          🎙 {t('tabs.solfege')}
        </button>
        <button
          type="button"
          className={mode === 'settings' ? '' : 'secondary'}
          onClick={() => {
            triggerHaptic('light')
            setMode('settings')
          }}
        >
          ⚙ {t('tabs.settings')}
        </button>
      </nav>
    </main>
  )
}

export default App
