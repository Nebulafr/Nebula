# Nebula - Coaching Platform

A modern coaching platform built with Next.js, Firebase, and AI integration.

## Features

- 🔐 **Authentication** - Firebase Auth with role-based access
- 👥 **User Management** - Coach and Student profiles
- 📚 **Programs** - Structured learning programs
- 📅 **Sessions** - Scheduled coaching sessions with Google Meet integration
- 💬 **Messaging** - Real-time chat between coaches and students
- 💳 **Payments** - Integrated payment processing
- 🤖 **AI Integration** - Google Genkit AI flows
- 📊 **Analytics** - Performance tracking and metrics
- 🎨 **Modern UI** - Built with Radix UI and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15.3.3 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google Genkit
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Calendar**: React Day Picker

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project
- Google Cloud API access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Nebula
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your Firebase project and Google APIs in `.env.local`

5. Run the development server:
```bash
npm run dev
```

6. For AI development with Genkit:
```bash
npm run genkit:dev
```

## Scripts

- `npm run dev` - Start development server on port 9002 with Turbopack
- `npm run genkit:dev` - Start Genkit development server
- `npm run genkit:watch` - Start Genkit with watch mode
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Project Structure

```
src/
├── ai/                 # AI flows and Genkit configuration
├── app/                # Next.js app router pages
├── components/         # Reusable components
│   ├── layout/         # Layout components
│   └── ui/             # UI components (Radix UI + shadcn/ui)
├── firebase/           # Firebase configuration and utilities
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── models/             # TypeScript data models
└── services/           # External service integrations
```

## Environment Variables

See `.env.example` for required environment variables:

- Firebase configuration
- Google APIs (for calendar integration)
- Genkit AI configuration
- Payment processing (Stripe)

## Development

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Tailwind CSS for styling

### Database Models

See `src/models/README.md` for comprehensive documentation of all data models and API methods.

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to your preferred platform (Vercel, Netlify, etc.)

3. Configure production environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

[Add your license here]