type PlaybackControlsProps = {
  playIntervalLabel: string
  playHintLabel: string
  onPlayInterval: () => void
  onPlayHint: () => void
}

export function PlaybackControls({
  playIntervalLabel,
  playHintLabel,
  onPlayInterval,
  onPlayHint,
}: PlaybackControlsProps) {
  return (
    <section className="actions">
      <button type="button" onClick={onPlayInterval}>
        {playIntervalLabel}
      </button>
      <button type="button" className="secondary" onClick={onPlayHint}>
        {playHintLabel}
      </button>
    </section>
  )
}
