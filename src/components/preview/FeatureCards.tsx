import { HeartPulse, MessageSquareText, ShieldCheck } from 'lucide-react';
import { m as motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { CardStyle } from '../../preview/previewConfig';
import { useFx } from '../../preview/effectsRuntime';
import FxCard, { FxIconBadge } from './effects/FxCard';

const FEATURES = [
  { icon: HeartPulse, title: 'Personalized care plans', body: 'Every plan is built around the person — goals, pace, and real life.' },
  { icon: MessageSquareText, title: 'Telehealth that works', body: 'Secure video visits with the same clinicians you know and trust.' },
  { icon: ShieldCheck, title: 'Privacy you can feel', body: 'Your information is protected at every step, by design.' },
];

function cardClasses(style: CardStyle): string {
  switch (style) {
    case 'elevated':
      return 'rounded-2xl bg-surface p-5 tk-shadow';
    case 'bordered':
      return 'rounded-2xl border tk-line-strong bg-surface p-5';
    case 'glass':
      return 'rounded-2xl border border-bg/10 bg-surface/60 p-5 backdrop-blur-md tk-shadow';
    case 'accentbar':
      return 'rounded-2xl border-t-4 border-accent bg-surface p-5 tk-shadow';
    case 'gradient':
      return 'rounded-2xl tk-tint-primary p-5 ring-1 tk-line';
    case 'inset':
      return 'rounded-2xl bg-bg p-5 ring-1 ring-inset tk-line-strong';
    case 'sticker':
      return 'rounded-2xl border tk-line-strong bg-surface p-5 shadow-[5px_5px_0_0_var(--color-ink)]';
    case 'outline-bold':
      return 'rounded-xl border-2 border-ink bg-bg p-5';
  }
}

interface FeatureCardsProps {
  cardStyle: CardStyle;
  item: Variants;
}

export default function FeatureCards({ cardStyle, item }: FeatureCardsProps) {
  const fx = useFx();
  return (
    <motion.section variants={item} className="grid gap-4 px-8 pb-14 sm:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, body }) => (
        <FxCard
          key={title}
          className={cardClasses(cardStyle)}
          // stagger-reveal makes each card its own cascading item
          variants={fx.staggerBoost ? item : undefined}
        >
          <FxIconBadge className="grid h-10 w-10 place-items-center rounded-xl tk-tint-primary">
            <Icon size={18} className="text-primary" />
          </FxIconBadge>
          <h3 className="mt-4 font-heading text-lg font-semibold text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
        </FxCard>
      ))}
    </motion.section>
  );
}
