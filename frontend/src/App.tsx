import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import HomePage from './pages/HomePage'
import BuilderPage from './pages/BuilderPage'
import LoginPage from './pages/LoginPage'
import ProjectsPage from './pages/ProjectsPage'
import { ThemeProvider } from './providers/theme-provider'
import { AuthProvider } from './providers/auth-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vibe-theme">
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/builder/:projectId" element={<BuilderPage />} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App