export default function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 max-w-xl text-ink-soft">{desc}</p>
      <div className="mt-8 rounded-2xl border border-dashed border-sage/60 bg-white/40 p-8 text-sm text-ink-soft">
        Aquí aparecerá el contenido. 🌱
      </div>
    </section>
  )
}
