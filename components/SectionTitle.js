export default function SectionTitle({
  title,
  onClick,
  titleText,
  sectionClassName = 'practice',
  sectionStyle = {},
  headingStyle = {},
}) {
  const text = titleText || title || '';
  return (
    <section className={sectionClassName} style={{ margin: '0 0 0.75rem', textAlign: 'center', ...sectionStyle }}>
      <h2
        style={{
          marginTop: 0,
          ...(onClick ? { cursor: 'pointer', userSelect: 'none' } : {}),
          ...headingStyle,
        }}
        onClick={onClick}
      >
        {text}
      </h2>
    </section>
  );
}

