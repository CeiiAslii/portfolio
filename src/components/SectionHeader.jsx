export function SectionHeader({ number, label, eyebrow, title, description, className = '' }) {
  return (
    <header className={className}>
      <p className="section-index"><span>{number}</span> / {label}</p>
      {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
      {title && <h2 className="section-heading">{title}</h2>}
      {description && <p className="section-description">{description}</p>}
    </header>
  )
}
