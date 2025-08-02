import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Code2, Zap, Globe } from 'lucide-react'
import { PROJECT_TEMPLATES } from '@/constants/templates'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] animate-[moveVertical_30s_ease_infinite] top-0 left-0" />
        <div className="absolute h-[400px] w-[400px] rounded-full bg-purple-500/20 blur-[120px] animate-[moveInCircle_20s_reverse_infinite] bottom-0 right-0" />
        <div className="absolute h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-[120px] animate-[moveHorizontal_40s_ease_infinite] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <nav className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Vibe Beta</h1>
          </div>
          <button
            onClick={() => navigate('/builder')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Start Building
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-5xl md:text-7xl font-bold mb-6">
              Build Apps with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-blue-500"> AI Magic</span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Describe your dream app in plain English and watch as Vibe Beta brings it to life with production-ready code.
            </p>
            <button
              onClick={() => navigate('/builder')}
              className="group px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all text-lg font-medium inline-flex items-center gap-2"
            >
              Start Building Now
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mt-20"
          >
            <div className="p-6 rounded-2xl bg-card border border-border">
              <Code2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Natural Language</h3>
              <p className="text-muted-foreground">
                Just describe what you want. No coding knowledge required.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <Zap className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Real-time Preview</h3>
              <p className="text-muted-foreground">
                See your app come to life instantly as you describe it.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-border">
              <Globe className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Deploy Ready</h3>
              <p className="text-muted-foreground">
                Export production-ready code or deploy with one click.
              </p>
            </div>
          </motion.div>

          {/* Templates */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-20"
          >
            <h3 className="text-3xl font-bold text-center mb-10">Start with a Template</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PROJECT_TEMPLATES.slice(0, 8).map((template, index) => (
                <button
                  key={index}
                  onClick={() => navigate('/builder', { state: { template } })}
                  className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-all text-left group"
                >
                  <div className="text-3xl mb-2">{template.emoji}</div>
                  <h4 className="font-medium group-hover:text-primary transition-colors">
                    {template.title}
                  </h4>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}