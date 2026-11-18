import { Link } from 'react-router-dom'
import { Upload, ArrowRight, Terminal, Table2, Key, Shield } from 'lucide-react'

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-float" />
        <div className="absolute top-20 right-0 w-80 h-80 bg-accent3/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-accent2/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        {/* grid */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
      </div>

      <section className="relative max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-panel/60 text-xs text-gray-400 mb-6">
          <Terminal size={12} /> SQL-editor inspired workspace
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          Your Files, <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">Directly to the Database.</span>
        </h1>
        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
          A simple and secure platform to submit text files and images directly to our administration workspace.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/upload" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent hover:bg-blue-600 text-white font-medium transition animate-glow">
            <Upload size={18} /> Upload Files
          </Link>
          <a href="#features" className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-border bg-panel/60 hover:bg-white/5 font-medium transition">
            Learn More <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* mock editor panel */}
      <section className="relative max-w-5xl mx-auto px-4 pb-20">
        <div className="rounded-xl border border-border bg-panel shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 h-9 border-b border-border bg-panel2">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-gray-500 font-mono">sqlvault — submissions.sql</span>
          </div>
          <div className="p-4 font-mono text-sm">
            <div className="text-gray-500">-- Recent submissions</div>
            <div><span className="text-accent3">SELECT</span> <span className="text-gray-300">senderName, fileType, fileSize</span> <span className="text-accent3">FROM</span> <span className="text-accent2">files</span> <span className="text-accent3">ORDER BY</span> <span className="text-gray-300">createdAt DESC</span>;</div>
            <div className="mt-2 text-gray-500">-- 42 rows returned · 12ms</div>
          </div>
        </div>
      </section>

      <section id="features" className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Shield, title: 'Secure by design', desc: 'Server-side validation, rate limiting, and JWT-protected admin routes.' },
            { icon: Table2, title: 'Database explorer UI', desc: 'Manage submissions like a SQL IDE with search, filters, and pagination.' },
            { icon: Key, title: 'No account needed', desc: 'Visitors submit files instantly without registration.' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-panel p-6 hover:border-accent/40 transition">
              <f.icon className="text-accent mb-3" size={24} />
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}