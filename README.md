<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1TGK1USmkBKq8bi_Q5nRH98ViL1l8CXqP

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure at least one provider key in [.env.local](.env.local):
   `GEMINI_API_KEY` or `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`
3. Run the app:
   `npm run dev`

The in-app provider switcher supports `Auto`, `Gemini`, `OpenAI`, `Anthropic`, and `Ollama`.

## Optional: Account Login (Firebase)

Study OS now supports account login/logout with Google, Microsoft, and Apple via Firebase Auth.

1. Add these keys to `.env.local`:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_APP_ID`
   - Optional: `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`
2. In Firebase Console, enable providers under `Authentication > Sign-in method`:
   - Google
   - Microsoft
   - Apple
3. Add your local/dev URL (for example `http://localhost:3000`) to Firebase authorized domains.

If Firebase keys are missing, the app still allows `Continue as Guest`.

## GitHub Pages

This repo serves Pages from `docs/`. To publish the actual app (not markdown docs):

1. Build and publish to `docs/`:
   `npm run build:pages`
2. Commit and push the updated `docs/` contents.

## Codex Skills Integration

This app includes a `Codex Skills` dashboard view backed by `public/codex-skills.json`.

1. Sync your local Codex skills catalog into the app:
   `npm run sync:skills`
2. Start the app and open the `Codex Skills` view in the sidebar.

When skills change in `~/.codex/skills`, run `npm run sync:skills` again to refresh.
# StudyOSUltra
