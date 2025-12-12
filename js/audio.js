let audioCtx = null;

export function playInterval(freq1, freq2) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  // Aumentiamo leggermente la durata totale della nota
  const noteDuration = 1.0; 

  playNote(freq1, now, noteDuration);
  playNote(freq2, now + noteDuration, noteDuration);
}

function playNote(freq, startTime, duration) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // 'triangle' è morbido ma chiaro.
  // Se vuoi un suono più "retro game", prova 'square' (ma abbassa il volume a 0.1)
  osc.type = 'triangle'; 
  osc.frequency.value = freq;

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // --- ENVELOPE (Busta sonora) MIGLIORATO ---
  
  // 1. Attacco immediato ma non "cliccante"
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Volume 0.3 (più alto)

  // 2. Sustain (Mantenimento)
  // Manteniamo il volume fino a poco prima della fine
  const releaseStart = startTime + duration - 0.2; // Inizia a sfumare 0.2s prima della fine
  gainNode.gain.setValueAtTime(0.3, releaseStart);

  // 3. Release (Rilascio morbido)
  // Usiamo esponenziale per naturalezza. Scendiamo a 0.001 (quasi zero)
  // Nota: exponentialRamp non può andare a 0 assoluto, quindi usiamo un valore piccolissimo.
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  
  // Chiudiamo a zero assoluto alla fine per sicurezza
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration + 0.05);

  osc.start(startTime);
  // Fermiamo l'oscillatore POCO DOPO la fine della sfumatura per evitare il "POP"
  osc.stop(startTime + duration + 0.1);
  
  setTimeout(() => {
    osc.disconnect();
    gainNode.disconnect();
  }, (duration * 1000) + 200);
}