export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-4">About SQLVault</h1>
      <p className="text-gray-400 leading-relaxed">
        SQLVault is a public file submission platform that delivers text files and images straight to an
        administrator's workspace. Inspired by modern database management tools, it provides a clean,
        SQL-editor-like experience for browsing, previewing, and managing submitted files.
      </p>
      <div className="mt-8 grid gap-4">
        {['Drag-and-drop uploads', 'Image & TXT previews', 'Secure admin dashboard', 'Rate limiting & validation'].map((t) => (
          <div key={t} className="rounded-lg border border-border bg-panel px-4 py-3 text-sm">{t}</div>
        ))}
      </div>
    </div>
  )
}