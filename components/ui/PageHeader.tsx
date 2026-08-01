export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="border-b border-white/10 bg-gradient-to-b from-elevated/60 to-void px-4 md:px-10 pb-8 pt-28 md:pt-36">
      {eyebrow && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-prime">
          {eyebrow}
        </p>
      )}
      <h1 className="font-display text-3xl md:text-5xl font-semibold text-bone">{title}</h1>
      {description && (
        <p className="mt-3 max-w-2xl text-mist leading-relaxed">{description}</p>
      )}
    </div>
  );
}
