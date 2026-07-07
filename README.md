# حوالاتي · My Transfers

A modern, **bilingual (Arabic RTL / English LTR)** money-transfer web app built with
**Angular 20**, **Angular Material (M3)**, **Tailwind CSS**, and **ngx-translate**.
Arabic is the default language, with instant runtime language switching (no reload).

> Application name: **حوالاتي** (Arabic) / **My Transfers** (English) — switches automatically with the language.

---

## ✨ Features

- 🌍 **Full i18n from day one** — Arabic (RTL, default) + English (LTR), instant switch, persisted in `localStorage`.
- 🎨 **Material 3 design system** — a navy/amber palette applied through Tailwind **and** Angular Material tokens.
- 🔐 **Authentication** — login page + route guards (demo credentials, swap in a real API).
- 📊 **Dashboard** — balance card, quick actions, scheduled transfers, spending insights, recent transactions.
- 💸 **Send money** — recipient picker, live currency conversion, fee breakdown & summary.
- 🏦 **Banks** — searchable CRUD list (add / edit / delete) with dialogs.
- 📄 **Reports** — printable report exported to **PDF** in the active language (RTL/LTR).
- 👤 **Profile & Settings** — profile, membership tier, tabbed account / security / notifications.
- 🔤 **Fonts** — Cairo (Arabic) / Inter (English), switched automatically; Material Symbols icons.
- 🔢 **Localized numbers, dates & currency** via the `Intl` API (re-formats on language change).

---

## 🧰 Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Angular 20 (standalone components, signals) |
| UI components | Angular Material 20 (M3) |
| Styling | Tailwind CSS 3 (Preflight enabled) |
| i18n | `@ngx-translate/core` v16 (runtime switching) |
| PDF export | `jspdf` + `html2canvas` |
| Icons | Material Symbols Outlined |

---

## 🚀 Getting started

```bash
# install
npm install

# run the dev server (http://localhost:4200)
npm start

# production build → dist/hawalaty
npm run build

# unit tests
npm test
```

> **Demo login:** `admin@hawalaty.com` / `123456`

---

## 🌐 Internationalization

Translations live in `src/assets/i18n/{ar,en}.json`. **Never hardcode UI strings** — always use keys:

```html
<!-- GOOD -->
{{ 'dashboard.title' | translate }}
<!-- BAD -->
Dashboard
```

Everything is driven by [`LanguageService`](src/app/core/language.service.ts) — the single source of truth
for the active language, direction (`dir`), font (`--app-font`), page `<title>`, and persistence.
Numbers/dates/currency use the `Intl`-based [`FormatService`](src/app/core/format.service.ts) and the
`localNumber` / `localCurrency` / `localDate` pipes, so they re-format instantly on language change.

See **[I18N.md](I18N.md)** for the full guide (adding keys, adding a third language, PDF behavior).

---

## 🎨 Design system

The Material 3 **navy/amber** palette is defined once and shared:

- **Tailwind** — full token set (`primary`, `secondary`, `surface-container-*`, `outline`, …) plus custom
  spacing, typography, and font families in [`tailwind.config.js`](tailwind.config.js).
- **Angular Material** — the same colors mapped onto `--mat-sys-*` tokens in
  [`src/styles.scss`](src/styles.scss), so dialogs, menus, and snackbars match.

Reusable utilities: `.glass-card`, `.tonal-elevation`, and the responsive `.app-sidebar` drawer.

---

## 🗺️ Routes

| Path | Page | Guard |
| --- | --- | --- |
| `/login` | Login | guest only |
| `/dashboard` | Dashboard | auth |
| `/transfers` | Send money | auth |
| `/banks` | Banks (CRUD) | auth |
| `/reports` | Reports (PDF export) | auth |
| `/settings` | Profile & Settings | auth |

Authenticated routes render inside the [`Layout`](src/app/layout/layout.ts) shell
(sidebar + header). Auth state is handled by [`AuthService`](src/app/core/auth.service.ts) and
the functional guards in [`auth.guard.ts`](src/app/core/auth.guard.ts).

---

## 📁 Project structure

```
src/
├─ app/
│  ├─ core/            # LanguageService, FormatService, AuthService, guards, PDF, pipes
│  ├─ layout/          # app shell (sidebar + header)
│  ├─ shared/          # language switcher, field-error, dialogs
│  ├─ features/
│  │  ├─ auth/         # login
│  │  ├─ dashboard/    # dashboard + transfer dialog
│  │  ├─ transfers/    # send money
│  │  ├─ banks/        # banks CRUD + dialog
│  │  ├─ reports/      # PDF report
│  │  └─ settings/     # profile & settings
│  └─ data/            # mock data (transfers, banks)
└─ assets/i18n/        # ar.json, en.json
```

---

## 📝 Notes

- **Auth & data are mock/demo.** `AuthService.login()` validates hard-coded credentials and the
  feature pages use in-memory mock data. Swap `login()` for a real HTTP call and replace the mock
  arrays with API calls when a backend is available.
- **Arabic PDFs** are produced by rasterizing the live (already shaped) DOM, so RTL and Arabic
  ligatures render correctly without embedding Arabic fonts into jsPDF (trade-off: PDF text is an image).

---

<sub>Built with Angular 20 · Bilingual by design.</sub>
