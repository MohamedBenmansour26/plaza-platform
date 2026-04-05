import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Inline primitive components (no @radix-ui — not yet installed)
// ---------------------------------------------------------------------------

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';

function Button({
  children,
  variant = 'default',
  className,
}: {
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  const base =
    'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-10 px-4 py-2 cursor-default select-none';
  const variants: Record<ButtonVariant, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };
  return <button className={cn(base, variants[variant], className)}>{children}</button>;
}

function Input({ placeholder, className }: { placeholder?: string; className?: string }) {
  return (
    <input
      readOnly
      placeholder={placeholder}
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className,
      )}
    />
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)}>
      {children}
    </div>
  );
}

function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col space-y-1 p-6 pb-2">{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold leading-none tracking-tight">{children}</h3>;
}

function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-6 pt-0">{children}</div>;
}

function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center p-6 pt-0 border-t border-border mt-4">{children}</div>;
}

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
}) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';
  const variants: Record<BadgeVariant, string> = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border text-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
  };
  return <span className={cn(base, variants[variant])}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold tracking-tight mb-6 pb-2 border-b border-border">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Color swatch
// ---------------------------------------------------------------------------

function ColorSwatch({ token, bgClass, label }: { token: string; bgClass: string; label?: string }) {
  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className={cn('h-16 w-full rounded-md border border-border/50', bgClass)} />
      <p className="text-xs font-mono text-foreground truncate">{token}</p>
      {label && <p className="text-xs text-muted-foreground truncate">{label}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Spacing bar
// ---------------------------------------------------------------------------

function SpacingBar({
  token,
  widthClass,
  pxValue,
  unitLabel,
  pxLabel,
}: {
  token: string;
  widthClass: string;
  pxValue: string;
  unitLabel: string;
  pxLabel: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-mono text-muted-foreground w-12 shrink-0">{token}</span>
      <div className={cn('h-4 rounded bg-primary/80', widthClass)} />
      <span className="text-xs text-muted-foreground shrink-0">
        {pxValue}{pxLabel} ({token} {unitLabel})
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DesignPreviewPage() {
  const t = await getTranslations('designPreview');

  // Color tokens derived from tailwind.config.ts / globals.css
  const colorSwatches = [
    { token: 'primary', bgClass: 'bg-primary', label: 'hsl(24.6 95% 53.1%) — terra cotta' },
    { token: 'primary-foreground', bgClass: 'bg-primary-foreground', label: 'hsl(60 9.1% 97.8%)' },
    { token: 'secondary', bgClass: 'bg-secondary', label: 'hsl(60 4.8% 95.9%)' },
    { token: 'secondary-foreground', bgClass: 'bg-secondary-foreground', label: 'hsl(24 9.8% 10%)' },
    { token: 'muted', bgClass: 'bg-muted', label: 'hsl(60 4.8% 95.9%)' },
    { token: 'muted-foreground', bgClass: 'bg-muted-foreground', label: 'hsl(25 5.3% 44.7%)' },
    { token: 'accent', bgClass: 'bg-accent', label: 'hsl(60 4.8% 95.9%)' },
    { token: 'accent-foreground', bgClass: 'bg-accent-foreground', label: 'hsl(24 9.8% 10%)' },
    { token: 'destructive', bgClass: 'bg-destructive', label: 'hsl(0 84.2% 60.2%)' },
    { token: 'destructive-foreground', bgClass: 'bg-destructive-foreground', label: 'hsl(60 9.1% 97.8%)' },
    { token: 'background', bgClass: 'bg-background', label: 'hsl(0 0% 100%)' },
    { token: 'foreground', bgClass: 'bg-foreground', label: 'hsl(20 14.3% 4.1%)' },
    { token: 'card', bgClass: 'bg-card', label: 'hsl(0 0% 100%)' },
    { token: 'card-foreground', bgClass: 'bg-card-foreground', label: 'hsl(20 14.3% 4.1%)' },
    { token: 'border', bgClass: 'bg-border', label: 'hsl(20 5.9% 90%)' },
    { token: 'input', bgClass: 'bg-input', label: 'hsl(20 5.9% 90%)' },
    { token: 'ring', bgClass: 'bg-ring', label: 'hsl(24.6 95% 53.1%)' },
  ];

  // Spacing: tailwind config uses 8px base — value = step × 8px
  // Steps defined: 1→8, 2→16, 3→24, 4→32, 5→40, 6→48, 8→64, 10→80, 12→96, 16→128
  const spacingRows = [
    { token: '1', px: '8',   widthClass: 'w-2'  },
    { token: '2', px: '16',  widthClass: 'w-4'  },
    { token: '3', px: '24',  widthClass: 'w-6'  },
    { token: '4', px: '32',  widthClass: 'w-8'  },
    { token: '5', px: '40',  widthClass: 'w-10' },
    { token: '6', px: '48',  widthClass: 'w-12' },
    { token: '8', px: '64',  widthClass: 'w-16' },
    { token: '10', px: '80', widthClass: 'w-20' },
    { token: '12', px: '96', widthClass: 'w-24' },
    { token: '16', px: '128',widthClass: 'w-32' },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold tracking-tight">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-0">

        {/* ---------------------------------------------------------------- */}
        {/* 1. Color palette                                                  */}
        {/* ---------------------------------------------------------------- */}
        <Section title={t('colorsSection')}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {colorSwatches.map((swatch) => (
              <ColorSwatch
                key={swatch.token}
                token={swatch.token}
                bgClass={swatch.bgClass}
                label={swatch.label}
              />
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* 2. Typography                                                     */}
        {/* ---------------------------------------------------------------- */}
        <Section title={t('typographySection')}>
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl font-bold tracking-tight">{t('heading1')}</h1>
              <p className="text-xs font-mono text-muted-foreground mt-1">text-5xl / font-bold</p>
            </div>
            <div>
              <h2 className="text-4xl font-bold tracking-tight">{t('heading2')}</h2>
              <p className="text-xs font-mono text-muted-foreground mt-1">text-4xl / font-bold</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">{t('heading3')}</h3>
              <p className="text-xs font-mono text-muted-foreground mt-1">text-2xl / font-semibold</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold">{t('heading4')}</h4>
              <p className="text-xs font-mono text-muted-foreground mt-1">text-xl / font-semibold</p>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-base leading-7">{t('bodyText')}</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">text-base / leading-7</p>
            </div>
            <div>
              <p className="text-sm leading-6">{t('smallText')}</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">text-sm / leading-6</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('mutedText')}</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">text-sm / text-muted-foreground</p>
            </div>
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* 3. Spacing scale                                                  */}
        {/* ---------------------------------------------------------------- */}
        <Section title={t('spacingSection')}>
          <div className="space-y-3">
            {spacingRows.map(({ token, px, widthClass }) => (
              <SpacingBar
                key={token}
                token={token}
                widthClass={widthClass}
                pxValue={px}
                unitLabel={t('spacingUnit')}
                pxLabel={t('spacingPx')}
              />
            ))}
          </div>
        </Section>

        {/* ---------------------------------------------------------------- */}
        {/* 4. shadcn/ui components                                           */}
        {/* ---------------------------------------------------------------- */}
        <Section title={t('componentsSection')}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Button</CardTitle>
                <CardDescription>All variants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Button variant="default">{t('buttonDefault')}</Button>
                  <Button variant="secondary">{t('buttonSecondary')}</Button>
                  <Button variant="outline">{t('buttonOutline')}</Button>
                  <Button variant="ghost">{t('buttonGhost')}</Button>
                  <Button variant="destructive">{t('buttonDestructive')}</Button>
                </div>
              </CardContent>
            </Card>

            {/* Input */}
            <Card>
              <CardHeader>
                <CardTitle>Input</CardTitle>
                <CardDescription>Text field</CardDescription>
              </CardHeader>
              <CardContent>
                <Input placeholder={t('inputPlaceholder')} />
              </CardContent>
            </Card>

            {/* Card sample */}
            <Card>
              <CardHeader>
                <CardTitle>{t('cardTitle')}</CardTitle>
                <CardDescription>{t('cardDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{t('cardContent')}</p>
              </CardContent>
              <CardFooter>
                <p className="text-xs text-muted-foreground">{t('cardFooter')}</p>
              </CardFooter>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Badge</CardTitle>
                <CardDescription>All variants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">{t('badgeDefault')}</Badge>
                  <Badge variant="secondary">{t('badgeSecondary')}</Badge>
                  <Badge variant="outline">{t('badgeOutline')}</Badge>
                  <Badge variant="destructive">{t('badgeDestructive')}</Badge>
                </div>
              </CardContent>
            </Card>

          </div>
        </Section>

      </div>
    </main>
  );
}
