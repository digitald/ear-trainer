import { SIMPLE_INTERVALS } from './intervals.js';
import { playAscendingInterval } from './audio.js';

document.getElementById('playButton').addEventListener('click', () => {
  const select = document.getElementById('intervalSelect');
  const interval = parseInt(select.value);
  const baseFreq = 440; // A4
  playAscendingInterval(baseFreq, interval);
});