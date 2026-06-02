<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project conventions (Cursor rules)

Detailed, file-scoped development rules live in **`.cursor/rules/`** (`.mdc` files). Read them when implementing features:

| Rule file | Topic |
|-----------|--------|
| `00-project-overview.mdc` | Stack, folder layout (always applied) |
| `i18n-next-intl.mdc` | Locales, messages, navigation |
| `api-proxy-security.mdc` | Proxy, cookies, env vars |
| `state-and-data-fetching.mdc` | Zustand, SWR, ISR |
| `react-and-ui.mdc` | Components, layout, themes |
| `forms-and-features.mdc` | RHF + Zod, feature modules, auth |
| `shadcn-and-styling.mdc` | Tailwind v4, shadcn/ui |

Human-oriented setup guide: `README.md`.
