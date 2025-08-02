# ai-powered-app


    Build an AI-powered app building platform called 'vibe-beta' similar to Lovable. 
    This should be a web application that allows users to create web apps by chatting with AI.
    
    Key features:
    - Natural language chat interface for app creation
    - Real-time preview of generated applications
    - Code generation with React and Node.js
    - Project management dashboard
    - Save and load projects
    - Export generated code
    - Beautiful modern UI with glass morphism design
    - WebSocket for real-time updates
    - AI integration for understanding app requirements
    - Template system for common app types
    
    Tech stack:
    - Frontend: React with TypeScript, Tailwind CSS, Framer Motion
    - Backend: Node.js with Express, TypeScript
    - Database: PostgreSQL with Prisma ORM
    - Real-time: Socket.io
    - AI: Integration with OpenAI API
    - Build tool: Vite
    
    The app should have a split-screen interface with chat on the left and preview on the right.
    Include authentication, project persistence, and deployment capabilities.
    

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ (for web/API projects)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
cd ai-powered-app
```

2. Install dependencies:
```bash
cd frontend && npm install && cd ../backend && npm install
```

3. Start the development server:
```bash
./run_local.sh
```

Or manually:
```bash
# Terminal 1\ncd backend && npm start\n\n# Terminal 2\ncd frontend && npm start
```

## 🏗️ Project Structure

```
Dockerfile
backend
  package.json
  src
    index.js
    models
    routes
    services
docker-compose.yml
docs
frontend
  package.json
  public
  src
    App.css
    App.js
    components
      Navbar.js
    pages
      HomePage.js
```

## ✨ Features

- ✅ Responsive design
- ✅ Modern UI
- ✅ Fast performance
- ✅ User dashboard
- ✅ Authentication
- ✅ API endpoints
- ✅ Database
- ✅ authentication
- ✅ dashboard
- ✅ messaging

## 🛠️ Built With

- **Frontend**: React, React Router, CSS3
- **Backend**: Node.js, Express
- **Database**: SQLite (upgradeable to PostgreSQL)

## 📱 Usage

1. Open http://localhost:3000 in your browser
2. Browse the homepage
3. Navigate to the dashboard
4. Interact with features

## 🚀 Deployment

### Local Deployment
The project is already set up for local development. Just run:
```bash
./run_local.sh
```

### Docker Deployment
```bash
docker-compose up
```

### Cloud Deployment
This project is ready for cloud deployment. You can deploy to:
- Heroku
- AWS
- Google Cloud
- Vercel/Netlify (for frontend)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Contact

Your Name - your.email@example.com

Project Link: [ai-powered-app](ai-powered-app)

---
Built with ❤️ by Virtual Company System
