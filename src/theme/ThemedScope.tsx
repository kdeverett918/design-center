import { useEffect, useMemo } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import type { FontPairing, Palette } from '../types';
import { themeVars } from './applyTheme';
import { loadFonts } from './loadFonts';

interface ThemedScopeProps {
  palette: Palette;
  fonts: FontPairing;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: 'div' | 'section' | 'article';
}

// The primitive that makes the colorful wall possible: scopes a palette + font
// pairing to its OWN root via CSS-var inline styles and loads the fonts. Many
// ThemedScopes coexist on one screen, each rendering in its own colors.
export default function ThemedScope({
  palette,
  fonts,
  children,
  className,
  style,
  as = 'div',
}: ThemedScopeProps) {
  useEffect(() => {
    loadFonts(fonts);
  }, [fonts]);

  const vars = useMemo(() => themeVars(palette, fonts), [palette, fonts]);
  const Tag = as;

  return (
    <Tag
      data-dark={palette.isDark ? 'true' : 'false'}
      className={className}
      style={{ ...vars, ...style }}
    >
      {children}
    </Tag>
  );
}
