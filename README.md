# Ear Trainer

Repository con:
- versione legacy web (`index.html`, `quiz.html`, cartella `js/`)
- nuova app in migrazione `React + TypeScript + Vite + Capacitor` in `ear-trainer-app/`

## Legacy
Versione originale disponibile su GitHub Pages:
[https://digitald.github.io/ear-trainer/](https://digitald.github.io/ear-trainer/)

## Nuova app (work in progress)
Per avviare la nuova base:

```bash
cd ear-trainer-app
npm install
npm run dev
```

Per build e sync Android (senza Android Studio):

```bash
npm run build
npx cap sync android
```

## Fatto finora
- Setup nuova app `ear-trainer-app` con `React + TypeScript + Vite + Capacitor (Android)`.
- UI riscritta in chiave moderna, smartphone-first, con componenti React modulari.
- Supporto multilingua `IT/EN` con `i18next` e selettore lingua.
- Audio integrato con campioni legacy (`sounds/`) e fallback sintetico.
- Modalita `Training` migrata e funzionante.
- Modalita `Quiz` aggiunta (punteggio, domande, replay, hint, schermata finale).
- Sezione onboarding iniziale aggiunta.
- UX quiz migliorata con evidenziazione risposta corretta/sbagliata.
- Persistenza `localStorage` per onboarding, preferenze training, modalita e high score quiz.
- Onboarding reso persistente con azione "rivedi onboarding" da interfaccia.
- Rifiniture UI/accessibilita (stati visuali risposta, feedback con `aria-live`, miglioramenti mobile header).
- Build web e sync Capacitor verificati.
- Nuovo modulo `Solfeggio` aggiunto con UI dedicata e navigazione a tab.
- Spartito cantato estratto in componenti modulari (`SingingStaff`, `SingingControls`) e dominio dati separato (`domain/solfege.ts`).
- Flusso guidato implementato: tonica iniziale (3s, nota evidenziata), count-in `4-3-2-1`, fase esecuzione, fase review.
- Replay di controllo post-esecuzione aggiunto con playhead e evidenziazione progressiva.
- Click metronomico percussivo introdotto per count-in/battiti, per evitare confusione con note tonali.
- Progressione difficolta a livelli impostata (2 prove per livello) con avanzamento automatico e banner "livello completato".

## Da fare (prossimi step)
- Rifiniture finali UI/animazioni (micro-transizioni, polish visuale, dark mode opzionale).
- Test funzionali completi su smartphone reali (audio unlock, latenza, viewport dinamico).
- Preparare pipeline release Android (APK/AAB) quando si passa ad Android Studio.
- Aggiungere feedback dedicato di livello completato con numero livello (es. `Livello 1 completato`).
- Introdurre configurazione JSON esterna per i livelli di solfeggio (import/export contenuti).
- Opzione modalita replay: `solo battiti` vs `battiti + melodia guida`.
- Integrare registrazione microfono reale e confronto intonazione/ritmo (analisi base in tempo reale o post take).

