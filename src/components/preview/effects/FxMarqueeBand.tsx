// Edge-to-edge scrolling band between the hero and the feature cards. The
// content is rendered twice so the -50% ticker keyframe loops seamlessly;
// reduced-motion users get a static row (global CSS kills the animation).
const WORDS = ['Speech therapy', 'Telehealth', 'Evaluations', 'Family coaching', 'Care plans'];

export default function FxMarqueeBand({ mode }: { mode: 'quiet' | 'ticker' }) {
  const bold = mode === 'ticker';
  const rail = (hidden: boolean) => (
    <span aria-hidden={hidden || undefined} className="flex w-max shrink-0 items-center">
      {WORDS.map((w) => (
        <span key={w} className="flex items-center">
          <span
            className={
              bold
                ? 'font-heading text-2xl font-bold uppercase tracking-tight text-ink'
                : 'text-sm font-medium text-muted'
            }
          >
            {w}
          </span>
          <span
            aria-hidden="true"
            className={`mx-5 inline-block rounded-full ${bold ? 'h-2.5 w-2.5 bg-primary' : 'h-1.5 w-1.5 bg-accent'}`}
          />
        </span>
      ))}
    </span>
  );

  return (
    <div
      className={`overflow-hidden border-y tk-line bg-bg ${bold ? 'py-4' : 'py-2.5'}`}
      aria-label={`${WORDS.join(', ')}`}
    >
      <div
        className="flex w-max"
        style={{ animation: `ticker ${bold ? 14 : 26}s linear infinite` }}
      >
        {rail(false)}
        {rail(true)}
      </div>
    </div>
  );
}
