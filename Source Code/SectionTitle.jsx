function SectionTitle({
  eyebrow,
  title,
  description,
  center = false,
}) {
  return (
    <div
      className={`section-title ${
        center ? "section-title-center" : ""
      }`}
    >
      {eyebrow && (
        <span className="eyebrow">
          {eyebrow}
        </span>
      )}

      <h2>{title}</h2>

      {description && (
        <p>{description}</p>
      )}
    </div>
  );
}

export default SectionTitle;