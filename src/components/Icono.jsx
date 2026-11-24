export default function Icono({ nombre, tamano = 24, clase = '' }) {
  return (
    <svg
      className={`icono ${clase}`.trim()}
      width={tamano}
      height={tamano}
      aria-hidden="true"
      focusable="false"
    >
      <use href={`/icons.svg#${nombre}`} />
    </svg>
  )
}
