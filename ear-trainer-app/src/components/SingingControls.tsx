type SingingStatus = 'ready' | 'preparing' | 'recording' | 'review'

type SingingControlsProps = {
  status: SingingStatus
  readyText: string
  preparingText: string
  recordingText: string
  reviewText: string
  retryLabel: string
  nextLabel: string
  replayLabel: string
  replayDisabled?: boolean
  onStart: () => void
  onStop: () => void
  onRetry: () => void
  onNext: () => void
  onReplay: () => void
}

export function SingingControls({
  status,
  readyText,
  preparingText,
  recordingText,
  reviewText,
  retryLabel,
  nextLabel,
  replayLabel,
  replayDisabled = false,
  onStart,
  onStop,
  onRetry,
  onNext,
  onReplay,
}: SingingControlsProps) {
  return (
    <section className="card singing-controls-card">
      {status === 'ready' ? (
        <>
          <button type="button" className="singing-fab singing-fab-mic" onClick={onStart} aria-label={readyText}>
            <span className="mic-dot" />
            <span className="mic-stem" />
          </button>
          <p className="singing-status-text">{readyText}</p>
        </>
      ) : null}

      {status === 'recording' ? (
        <>
          <button
            type="button"
            className="singing-fab singing-fab-stop is-recording"
            onClick={onStop}
            aria-label={recordingText}
          >
            ■
          </button>
          <p className="singing-status-text">{recordingText}</p>
        </>
      ) : null}

      {status === 'preparing' ? (
        <>
          <button type="button" className="singing-fab singing-fab-stop is-recording" aria-label={preparingText} disabled>
            ⏳
          </button>
          <p className="singing-status-text">{preparingText}</p>
        </>
      ) : null}

      {status === 'review' ? (
        <div className="singing-review-row">
          <button type="button" className="secondary singing-side-btn" onClick={onRetry}>
            ↺ {retryLabel}
          </button>
          <button type="button" className="singing-fab singing-fab-play" onClick={onReplay} disabled={replayDisabled}>
            ▶ {replayLabel}
          </button>
          <button type="button" className="secondary singing-side-btn" onClick={onNext}>
            {nextLabel} →
          </button>
          <p className="singing-status-text">{reviewText}</p>
        </div>
      ) : null}
    </section>
  )
}

export type { SingingStatus }
