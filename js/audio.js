let audioCtx = null;

export function playInterval(freq1, freq2) {
  // Inizializza il contesto se non esiste
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  const noteDuration = 0.8; // La nota "principale" dura 0.8s
  const gap = 0.1; // Piccola pausa tra le note

  // Scheduliamo le due note
  playNote(freq1, now, noteDuration);
  playNote(freq2, now + noteDuration + gap, noteDuration);
}

function playNote(freq, startTime, duration) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'triangle'; // Suono morbido
  osc.frequency.value = freq;

  // Collega i nodi
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // --- CONFIGURAZIONE VOLUME (ADSR) ---
  const attackTime = 0.05;  // Tempo per arrivare al volume massimo
  const releaseTime = 0.5;  // Tempo di sfumatura finale (la "coda")
  const volume = 0.3;       // Volume massimo

  // 1. Inizia muto
  gainNode.gain.setValueAtTime(0, startTime);
  
  // 2. Attack: Sale al volume massimo velocemente
  gainNode.gain.linearRampToValueAtTime(volume, startTime + attackTime);
  
  // 3. Sustain: Mantiene il volume fino alla fine della durata "nominale"
  gainNode.gain.setValueAtTime(volume, startTime + duration);
  
  // 4. Release: Sfuma a zero DOPO la durata
  // Usiamo linearRamp per assicurarci che arrivi a zero perfetto
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration + releaseTime);

  // --- AVVIO E STOP ---
  osc.start(startTime);
  
  // STOP: Fermiamo l'oscillatore solo DOPO che la sfumatura è finita
  // Aggiungiamo 0.1s extra di sicurezza per evitare click
  const stopTime = startTime + duration + releaseTime + 0.1;
  osc.stop(stopTime);

  // Pulizia della memoria
  setTimeout(() => {
    osc.disconnect();
    gainNode.disconnect();
  }, (duration + releaseTime + 0.2) * 1000);
}