# Deep Discipleship Hub

A web app concept for deep discipleship relationships between disciplers and disciplees. The UI highlights role-based dashboards, messaging, study plans, and progress tracking.

## Features

- Role-based experiences for disciplers and disciplees
- Messaging and prayer request workflows
- Structured study plans and weekly rhythms
- Progress tracking for spiritual habits
- Credits and attribution for source inspiration

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint checks:

```bash
npm run lint
```

## Environment Variables

Set these in local `.env` and in Vercel:

- `DATABASE_URL` - PostgreSQL connection string
- `RESEND_API_KEY` - API key for sending invitation emails
- `INVITE_FROM_EMAIL` - From address (example: `Discipleship <noreply@hbcmo.org>`)
- `NEXT_PUBLIC_APP_URL` - Public app URL used in invite links (example: `https://your-app.vercel.app`)

## Credits & Attribution

This app is inspired by the Deep Discipleship series by J.T. English. All rights and content attribution belong to the author and publisher.
