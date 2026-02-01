function SharePanel({
  title,
  text,
  description = 'Comparte este contenido en tus redes sociales favoritas.',
  label = 'Compartir',
  url,
  className = '',
}) {
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const shareText = text || title || 'Mira esta informacion'

  if (!shareUrl) {
    return null
  }

  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(shareText)

  const links = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      className:
        'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100',
    },
    {
      id: 'x',
      label: 'X',
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      className:
        'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100',
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      className:
        'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      className:
        'border-sky-200 bg-sky-50 text-sky-700 hover:border-sky-300 hover:bg-sky-100',
    },
  ]

  return (
    <section
      className={`rounded-2xl border border-[color:var(--app-border)] bg-white/80 p-5 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--app-muted)]">
            {label}
          </p>
          <p className="text-sm text-[var(--app-muted)]">{description}</p>
        </div>
        <span className="rounded-full border border-[color:var(--app-border)] px-3 py-1 text-xs text-[var(--app-muted)]">
          Link listo
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-xs font-semibold transition ${link.className}`}
            aria-label={`Compartir en ${link.label}`}
          >
            {link.label}
          </a>
        ))}
      </div>
    </section>
  )
}

export default SharePanel
