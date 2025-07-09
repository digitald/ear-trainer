export function playInterval(freq1, freq2) {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const gain = ctx.createGain();
  gain.gain.value = 0.2;
  gain.connect(ctx.destination);

  const osc1 = ctx.createOscillator();
  osc1.type = 'triangle'; // o 'sawtooth'
  osc1.frequency.value = freq1;
  osc1.connect(gain);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 1);

  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle'; // o 'sawtooth'
  osc2.frequency.value = freq2;
  osc2.connect(gain);
  osc2.start(ctx.currentTime + 1);
  osc2.stop(ctx.currentTime + 2);
}
