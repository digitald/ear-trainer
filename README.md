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

