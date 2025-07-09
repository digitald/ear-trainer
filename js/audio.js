export function playAscendingInterval(baseFreq, semitoneInterval) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const gain = ctx.createGain();
  gain.gain.value = 0.2;
  gain.connect(ctx.destination);

  const osc1 = ctx.createOscillator();
  osc1.frequency.value = baseFreq;
  osc1.connect(gain);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 1);

  const osc2 = ctx.createOscillator();
  const intervalFreq = baseFreq * Math.pow(2, semitoneInterval / 12);
  osc2.frequency.value = intervalFreq;
  osc2.connect(gain);
  osc2.start(ctx.currentTime + 1);
  osc2.stop(ctx.currentTime + 2);
}
