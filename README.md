# Vibe Beta - AI-Powered App Builder

<div align="center">
  <img src="docs/assets/logo.png" alt="Vibe Beta Logo" width="200" />
  
  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
  [![React Version](https://img.shields.io/badge/react-18.2.0-61dafb)](https://reactjs.org/)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)
  
  **Build fully functional web applications through natural language conversations**
  
  [Demo](https://vibe-beta.demo) | [Documentation](docs/) | [Report Bug](https://github.com/yourusername/vibe-beta/issues) | [Request Feature](https://github.com/yourusername/vibe-beta/issues)
</div>

## 🎯 Overview

Vibe Beta is an innovative AI-powered platform that democratizes web application development. Simply describe what you want to build in natural language, and watch as Vibe Beta generates a complete, functional web application in real-time.

### ✨ Key Features

- 🤖 **Natural Language Interface** - Just chat to create apps
- 👁️ **Real-time Preview** - See your app come to life instantly
- 🎨 **Beautiful UI** - Modern glass morphism design
- 💾 **Project Management** - Save, load, and organize your projects
- 🚀 **Export & Deploy** - Get production-ready code
- 🎯 **Smart Templates** - Start with pre-built app templates
- 🔧 **Full-Stack Generation** - Creates both frontend and backend
- 🔐 **Secure & Scalable** - Built with best practices

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn
- Git
- PostgreSQL (optional, SQLite used by default)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/vibe-beta.git
cd vibe-beta
```

2. Install dependencies:
```bash
# Install all dependencies
npm run install:all

# Or manually
cd backend && npm install
cd ../frontend && npm install
```

3. Set up environment variables:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

4. Start the development servers:
```bash
npm run dev

# Or use the convenience script
./run_local.sh
```

5. Open your browser:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🏗️ Architecture

```
vibe-beta/
├── frontend/                 # React TypeScript app
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature modules
│   │   ├── pages/          # Page components
│   │   └── services/       # API services
│   └── public/             # Static assets
├── backend/                # Express TypeScript API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── ai/            # AI integration
│   └── prisma/            # Database schema
├── shared/                # Shared types/utilities
├── docs/                  # Documentation
└── docker/               # Docker configs
```

## 🎮 Usage

### Creating Your First App

1. **Start a conversation**: Type what you want to build
   ```
   "Create a todo list app with user authentication"
   ```

2. **Watch the magic**: See your app generated in real-time

3. **Customize**: Refine with follow-up requests
   ```
   "Add a dark mode toggle"
   ```

4. **Export**: Download your code or deploy directly

### Available Commands

- `/template [name]` - Start with a template
- `/undo` - Undo last change
- `/export` - Export current project
- `/deploy` - Deploy to cloud

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Socket.io Client** - Real-time updates
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Prisma** - ORM
- **PostgreSQL/SQLite** - Database
- **Socket.io** - WebSockets
- **OpenAI API** - AI integration

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/vibe_beta
OPENAI_API_KEY=your-api-key
JWT_SECRET=your-secret
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- --testNamePattern="Chat"
```

## 📦 Building for Production

```bash
# Build both frontend and backend
npm run build

# Build separately
cd frontend && npm run build
cd backend && npm run build
```

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Manual Deployment
See our [deployment guide](docs/DEPLOYMENT.md) for platform-specific instructions.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Project Status

- Current Version: 0.1.0-alpha
- Status: In Development
- [Roadmap](docs/DEVELOPMENT_ROADMAP.md)
- [Changelog](CHANGELOG.md)

## 🔒 Security

- Report security vulnerabilities to security@vibe-beta.com
- See [SECURITY.md](SECURITY.md) for our security policy

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Lovable](https://lovable.dev) and similar platforms
- Built with [vibe-assets](https://github.com/AntonioErdeljac/vibe-assets)
- Powered by OpenAI's GPT models

## 📞 Support

- Documentation: [docs/](docs/)
- Issues: [GitHub Issues](https://github.com/yourusername/vibe-beta/issues)
- Discord: [Join our community](#)
- Email: support@vibe-beta.com

---

<div align="center">
  Made with ❤️ by the Vibe Beta Team
  
  ⭐ Star us on GitHub!
</div>
