export default function SectionTitle({
  title,
  onClick,
  titleText,
  sectionClassName = '',
  headingClassName = '',
}) {
  const text = titleText || title || '';
  return (
    <section className={`section-title ${sectionClassName}`.trim()}>
      <h2
        className={`section-title__heading ${onClick ? 'section-title__heading--clickable' : ''} ${headingClassName}`.trim()}
        onClick={onClick}
      >
        {text}
      </h2>
    </section>
  );
}
