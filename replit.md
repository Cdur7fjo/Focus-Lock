# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile**: Expo (React Native) — artifact `mobile` (نظام حياتي)

## Mobile App: نظام حياتي

A discipline / focus app built with Expo. Frontend-only, persists state via AsyncStorage. Arabic-first UI with RTL layout.

Features:
- Onboarding to set a personal confirmation passphrase (changeable only on day 1 of the month at 4:00 AM, 1-minute window)
- Add tasks: essential vs optional, pick allowed apps, optional minute timer, repeat by star (cancellable until midnight) or N days
- Today screen with progress, locked optional tasks until essentials are done
- Apps screen showing locked/unlocked apps depending on essentials state
- Settings: change passphrase, view required Android permissions, reset all data
- Animated gradient hero, press-scale haptics, dark theme

Files of interest:
- `artifacts/mobile/lib/store.tsx` — context provider with all business rules and AsyncStorage persistence
- `artifacts/mobile/lib/types.ts` — types
- `artifacts/mobile/lib/mockApps.ts` — mock app catalog
- `artifacts/mobile/components/*` — TaskCard, AppPickerSheet, ConfirmModal, AnimatedGradient, etc.
- `artifacts/mobile/app/index.tsx` — onboarding
- `artifacts/mobile/app/(tabs)/*` — tabs (Today / Apps / Settings)
- `artifacts/mobile/app/new-task.tsx` — task creation modal

Note: True Android-level app blocking (Device Admin, Accessibility Service, SYSTEM_ALERT_WINDOW, etc.) requires a signed native APK installed on the user's device with manually granted system permissions — that is documented in the Settings screen for production deployment via Expo Launch.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
