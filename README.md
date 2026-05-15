# Hétéro ou Homo ? (Gaydar App)

Une application parodique et 100% scientifique (non) qui détermine aléatoirement (mais avec conviction) votre orientation en fonction de votre prénom, avec une justification farfelue générée par l'IA Gemini.

## Prérequis

- Node.js (version 18+)
- Une clé d'API Google Gemini (gratuite sur [Google AI Studio](https://aistudio.google.com/))

## Installation

1. Clonez ce dépôt.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` à la racine du projet en vous basant sur `.env.example` :
   ```bash
   cp .env.example .env
   ```
4. Ouvrez le fichier `.env` et remplacez `MY_GEMINI_API_KEY` par votre vraie clé d'API.

## Lancement

Démarrez le serveur de développement :

```bash
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000) dans votre navigateur pour profiter de l'application !
