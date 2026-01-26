function ElectionListPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold font-[var(--font-display)] text-[var(--app-ink)]">
          Elecciones disponibles
        </h1>
        <p className="mt-2 text-sm text-[var(--app-muted)]">
          Selecciona un proceso para ver candidaturas, propuestas y comparaciones.
        </p>
      </div>
      <div className="rounded-2xl border border-dashed border-[color:var(--app-border)] bg-white/80 p-6 text-sm text-[var(--app-muted)]">
        Aun no hay datos cargados. Aqui se mostrara la lista de elecciones.
      </div>
    </section>
  )
}

export default ElectionListPage
