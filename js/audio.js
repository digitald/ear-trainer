let audioCtx = null;

export function playInterval(freq1, freq2) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;
  const noteDuration = 0.8; 
  const gap = 0.1; 

  playNote(freq1, now, noteDuration);
  playNote(freq2, now + noteDuration + gap, noteDuration);
}

// NUOVA FUNZIONE PER MELODIE
export function playMelody(baseFreq, sequence, speed = 0.4) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;

  sequence.forEach((semitones, index) => {
    // Calcoliamo la frequenza: FreqBase * 2^(semitoni/12)
    const noteFreq = baseFreq * Math.pow(2, semitones / 12);
    // Suoniamo note più brevi e staccate per la melodia
    playNote(noteFreq, now + (index * speed), speed * 0.9);
  });
}

function playNote(freq, startTime, duration) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'triangle'; 
  osc.frequency.value = freq;

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Envelope ADSR
  const attackTime = 0.05;
  const releaseTime = 0.5;
  const volume = 0.3;

  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(volume, startTime + attackTime);
  gainNode.gain.setValueAtTime(volume, startTime + duration);
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration + releaseTime);

  osc.start(startTime);
  osc.stop(startTime + duration + releaseTime + 0.1);

  setTimeout(() => {
    osc.disconnect();
    gainNode.disconnect();
  }, (duration + releaseTime + 0.2) * 1000);
}