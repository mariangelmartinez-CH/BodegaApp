type Props = {
  icon?: string
  title: string
  subtitle: string
}

function PageTitle({ icon, title, subtitle }: Props) {
  return (
    <header className="flex items-center gap-3 pb-5 pt-1">
      {icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-borde bg-superficie text-2xl">
          {icon}
        </span>
      )}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-texto">{title}</h1>
        <p className="text-sm text-suave">{subtitle}</p>
      </div>
    </header>
  )
}

export default PageTitle
