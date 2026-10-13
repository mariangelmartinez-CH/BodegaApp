type Props = {
  icon: string
  title: string
  subtitle: string
}

function PageTitle({ icon, title, subtitle }: Props) {
  return (
    <header className="py-6 text-center">
      <div className="text-6xl">{icon}</div>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-800">{title}</h1>
      <p className="mt-1 text-gray-500">{subtitle}</p>
    </header>
  )
}

export default PageTitle
