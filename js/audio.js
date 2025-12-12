// Creiamo una variabile per il contesto audio, ma non lo inizializziamo subito
// per rispettare le policy di autoplay dei browser.
let audioCtx = null;

export function playInterval(freq1, freq2) {
  // 1. Inizializzazione Singleton: Creiamo il contesto solo se non esiste
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  // 2. Resume: Se il contesto è sospeso (succede spesso su Chrome), lo riattiviamo
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;
  
  // Durata di ogni nota in secondi
  const noteDuration = 0.8; 

  playNote(freq1, now, noteDuration);
  playNote(freq2, now + noteDuration, noteDuration);
}

// Funzione helper per suonare una singola nota ed evitare ripetizioni di codice
function playNote(freq, startTime, duration) {
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'triangle'; 
  osc.frequency.value = freq;

  // Connessioni: Oscillatore -> Gain -> Casse
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Gestione Volume (Envelope) per evitare il "click"
  gainNode.gain.setValueAtTime(0, startTime); // Inizia muto
  gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05); // Fade-in veloce
  gainNode.gain.setValueAtTime(0.2, startTime + duration - 0.05); // Mantiene volume
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration); // Fade-out finale

  osc.start(startTime);
  osc.stop(startTime + duration);
  
  // Pulizia: scollega i nodi dopo che hanno suonato per liberare memoria
  setTimeout(() => {
    osc.disconnect();
    gainNode.disconnect();
  }, (duration * 1000) + 100);
}
