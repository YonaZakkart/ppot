export default function CantoDuelo({ texto, tono = 'neutro' }) {
  return (
    <div className={`canto canto--${tono}`} aria-live="polite" aria-atomic="true">
      <span className="canto__marca" aria-hidden="true" />
      <p key={texto} className="canto__texto">
        {texto}
      </p>
      <span className="canto__marca" aria-hidden="true" />
    </div>
  )
}
