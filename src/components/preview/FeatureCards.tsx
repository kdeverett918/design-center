import { HeartPulse, MessageSquareText, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { CardStyle } from '../../preview/previewConfig';

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
  }
}

interface FeatureCardsProps {
  cardStyle: CardStyle;
  item: Variants;
}

export default function FeatureCards({ cardStyle, item }: FeatureCardsProps) {
  return (
    <motion.section variants={item} className="grid gap-4 px-8 pb-14 sm:grid-cols-3">
      {FEATURES.map(({ icon: Icon, title, body }) => (
        <div key={title} className={cardClasses(cardStyle)}>
          <span className="grid h-10 w-10 place-items-center rounded-xl tk-tint-primary">
            <Icon size={18} className="text-primary" />
          </span>
          <h3 className="mt-4 font-heading text-lg font-semibold text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
        </div>
      ))}
    </motion.section>
  );
}
