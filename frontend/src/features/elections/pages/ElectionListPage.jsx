function ElectionListPage() {
  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Elecciones disponibles</h1>
        <p className="mt-2 text-sm text-slate-600">
          Selecciona un proceso para ver candidaturas, propuestas y comparaciones.
        </p>
      </div>
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        Aun no hay datos cargados. Aqui se mostrara la lista de elecciones.
      </div>
    </section>
  )
}

export default ElectionListPage
