import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Pagina no encontrada</h1>
      <p className="text-sm text-slate-600">
        La ruta que buscas no existe o aun no fue creada.
      </p>
      <Link className="text-sm font-medium text-slate-900 underline" to="/">
        Volver al inicio
      </Link>
    </section>
  )
}

export default NotFoundPage
