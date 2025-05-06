# KidLearn AI - Personalized Learning Platform for Children

An AI-powered learning platform for children aged 4-12 that focuses on skill-based learning rather than age-based progression.

## Features

- Personalized learning recommendations based on skills and capabilities
- Interactive learning modules for:
  - Mathematics (basic operations)
  - Language (alphabets, phrases, common words)
  - Computer basics
  - Creative skills (drawing)
  - Cooking skills (step-by-step recipes)
- Progress tracking
- Parent dashboard
- Cross-platform support (Web, Android, iOS)

## Tech Stack

- Frontend: HTML, CSS, JavaScript with Alpine.js
- Backend: Express.js
- Database & Authentication: Supabase (PostgreSQL)
- AI Integration: OpenAI API for personalized recommendations

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
kidlearn-ai/
├── frontend/           # Frontend application
├── backend/           # Express.js server
├── mobile/           # Mobile app (React Native)
└── docs/             # Documentation
```

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 