export function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div>;
}
