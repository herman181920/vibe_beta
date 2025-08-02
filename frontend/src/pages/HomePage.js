import React from 'react';
import './HomePage.css';

function HomePage() {
  return (
    <div className="home-page">
      <h1>Welcome to ai-powered-app</h1>
      <p>
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
    </p>
      <div className="features">
        <h2>Features</h2>
        <ul>
          <li>Responsive design</li>
          <li>Modern UI</li>
          <li>Fast performance</li>
          <li>User dashboard</li>
          <li>Authentication</li>
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
