# JFI Gasket — Mobile App (Expo / React Native)

Field app for JFI Gasket's shop floor: operators log in, pull CS work queues, and submit
production reports for five modules (Ring 1/2/3, Sealing Element, Double Jacketed) to the JFI
backend, plus PDF viewing and profile editing. Expo SDK 57 + React Native 0.86 + TypeScript
(strict), single repo, entry `index.js` → `App.tsx`.

## Dev environment

- Everything runs **natively on Windows** from `C:\Users\Celi\Documents\ngodonf\JFI-Backend\JFI-mobile-app`
  (git-bash; Node v24, npm 11). The WSL `Ubuntu-24.04` distro this repo used to live in no longer exists,
  so do not drive it with `wsl -d Ubuntu-24.04 …` any more.
- Install with `npm install` (npm + `package-lock.json`, no yarn/pnpm).
- Repo has **no `.env`** (it is gitignore) — see "API URLs" below before running anything.

## Commands (verified)

- `npm start` — Expo dev server (Metro). Also `npm run android`, `npm run ios`, `npm run web`.
- `npx tsc --noEmit` — the only static check; ~10 s, currently clean. Run it before committing.
- **There is no lint runner** — no ESLint/Prettier config, dependency or script; never invent
  `npm run lint`. The only tests are the dependency-free self-checks run by plain node's type
  stripping: `npm run check:alert` (`src/utils/appAlert.check.mjs`) and `npm run check:pdf`
  (`src/utils/csPdf.check.mjs`). Because plain node resolves ESM specifiers literally, a module
  under test must have **zero imports** — an extensionless relative import dies with
  `ERR_MODULE_NOT_FOUND` and a `.ts`-suffixed one fails `tsc` with `TS5097`; inject config as a
  parameter instead of importing it.
- `eas-cli` is installed globally on the Windows side (`eas` → v24.6.0), which satisfies the
  `cli.version >= 22.2.0` floor in `eas.json`. Build profiles: `development`, `preview` (APK),
  `production` (`autoIncrement`). Adding a **native module** (e.g. `react-native-pdf`) cannot ship
  over Expo Update — it needs a fresh `eas build`.

## API URLs (env vars)

`eas.json` injects `EXPO_PUBLIC_API_URL` per build profile. The mobile app treats it as the
origin only and derives all service prefixes in `src/api/apiConfig.ts`:

| Derived base | Used for |
| --- | --- |
| `${EXPO_PUBLIC_API_URL}/api/auth` | `/user/login`, `/user/now` |
| `${EXPO_PUBLIC_API_URL}/api/cs` | `/tasks/*`, `/download/:id` |
| `${EXPO_PUBLIC_API_URL}/api/produksi` | `/ring-satu`, `/djg`, `/se`, … |

For local development, create the gitignored `.env` with
`EXPO_PUBLIC_API_URL=https://jfi.faiqsr.my.id` (or the appropriate API origin). EAS profiles use
the same origin value. Do not add service prefixes to the environment variable; they are owned by
the shared API config.

## Architecture & conventions

- **Navigation is hand-rolled**: `renderScreen()`'s `switch` in `App.tsx`, no expo-router /
  react-navigation (the lockfile mention is only an optional peer). A new screen = a `case` there
  + a member of `ScreenType` in `src/type/FormType.ts`.
- **`App.tsx` owns all form state**: `formsData: Record<ScreenType, ScreenFormData>`, mutated only
  through `updateFormField`. Screens receive `(value, setter)` prop pairs built by
  `getRingProps` / `getSealingProps` / `getDoubleJacketProps` in `src/api/FormService.ts`
  (prop builders live in the API file, not next to the screens). New field ⇒ add to
  `ScreenFormData` + `initialFormState` in `src/type/FormType.ts` and to each prop builder.
- Layout: `src/screen/` (one file per screen), `src/component/{common,cs,forms}/`, `src/api/`,
  `src/hooks/`, `src/type/`, `src/utils/`.
- Dialogs: all user-facing alerts go through `src/utils/appAlert.ts` (`Alert.alert(title, message?, buttons?, options?)`),
  rendered by `src/component/common/AlertModalHost.tsx`, mounted once in `index.js`. Never import `Alert` from `react-native`.
- **CS/SO PDF is viewed IN-APP, never via the OS share sheet**: `src/utils/pdfHandler.ts` only downloads
  (`downloadCsPdfFile` — bearer token + one 401 refresh, deletes a stale cache file first, rejects a body that is
  not `%PDF-`); the viewer store lives in `src/utils/csPdf.ts` (`openCsPdfViewer` / `subscribeToCsPdf`) and is rendered
  by `src/component/common/CsPdfModalHost.tsx` (`react-native-pdf`), mounted once in `index.js`. Screens only call
  `openCsPdfViewer(taskId, fileName)`. Never re-add `Sharing.shareAsync` or a locally generated "summary" document.
- **API services**: one `async` function per endpoint using plain `fetch`, always returning
  `{ success, data? }` (never throwing), each owning its own Indonesian `AppAlert`/`Alert.alert(...)` call
  from `src/utils/appAlert.ts` (imported as `Alert` — the RN `Alert` from `react-native` is no longer used
  anywhere; it rendered a native OS dialog instead of the app's styled modal), logging
  with the `[API Request] GET -> ${url}` prefix, and handling 401 with a retry-once
  (`retryWithNewToken = false`) guarded by a module-level single-flight flag.
- **401 triggers refresh-then-logout, not instant logout**: `authService.refreshAccessToken()` POSTs the
  stored `refreshToken` to `/user/now/refresh` (single-flight via a shared `refreshPromise`), saves the new
  `accessToken` under `userToken` and emits a `TOKEN_REFRESHED` event (`App.tsx` re-syncs its state). Only
  when refresh fails does it hard-logout via the `FORCE_LOGOUT` event that `App.tsx` listens for.
  The server does **not rotate** the refresh token, so it stays in AsyncStorage until logout.
- Request payloads: production POSTs use camelCase server fields (`soNo`, `notedSizeOdId`,
  `finishGoodFG`), CS payloads use snake_case (`product_name`, `job_description`). Endpoint/screen
  mapping and payload assembly live in `buildPayload()` in `src/api/FormService.ts`.
- Copy, alerts and code comments are Indonesian; formatting helpers live in
  `src/utils/date.ts` and `src/utils/csHelpers.ts`.
- Styles: `StyleSheet.create` at the bottom of each file, sizes via `RFValue(...)` from
  `react-native-responsive-fontsize`; font scaling is disabled globally in `App.tsx`.
- Backend field names drift: extract them through `getFirstValidString(...)` /
  `getItem*()` helpers in `src/utils/csHelpers.ts` (tens of camel/snake aliases) rather than reading
  one key, and follow that pattern for new fields.

## Pitfalls

- `android/` and `ios/` are gitignored (continuous native generation) — never hand-edit them and
  don't expect to find them. Native config goes through `app.json` plugins;
  `expo-build-properties` sets `android.usesCleartextTraffic` (plain-HTTP backend), which
  **Expo Go ignores**. Behaviour that depends on config plugins needs a development build.
- The old AGENTS.md note pointed at Expo **v54** docs; this project is on **SDK 57**
  (`expo` 57.0.24 installed, `~57.0.22` pinned). Read
  https://docs.expo.dev/versions/v57.0.0/ for the actual API surface.
- `App.js` is an unreferenced Expo template stub ("Open up App.js…"). Metro resolves `./App` to
  `.tsx` before `.js` here, so `App.tsx` is the live root component — never edit `App.js` expecting
  a change. `CLAUDE.md` merely contains `@AGENTS.md`.
- Form drafts persist to AsyncStorage under `@app_form_draft_v3` + `@app_last_active_screen` with a
  500 ms debounce; bump the key version when the draft shape changes or stale drafts get restored.
  Auth keys: `userToken`, `refreshToken`, `userId`, `userName`, `userRole`, `userPermissions`.
- `app.json` version (1.0.1) + `runtimeVersion.policy: appVersion` + `expo-updates`: an OTA update
  only reaches builds with the matching runtime version, so bump versions via the EAS profiles.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `chore:`, `style:`); single branch
  `main` → https://github.com/FaiqSr/JFI-mobile-app. No CI workflows exist in this repo.
