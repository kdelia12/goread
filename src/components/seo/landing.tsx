import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { BookGrid } from "@/components/book-grid";
import type { Book } from "@/lib/types";

/** A Lucide-style icon: any component that takes a className. */
type IconType = React.ComponentType<{ className?: string }>;

export interface CtaLink {
  href: string;
  label: string;
}

/** Outer page padding/width — every landing page wraps its content in this. */
export function LandingShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">{children}</div>;
}

export function LandingHero({
  eyebrow,
  title,
  lede,
  primary,
  secondary,
}: {
  eyebrow: string;
  title: string;
  /** Rich node so pages can bold a phrase or two inside the lede. */
  lede: React.ReactNode;
  primary?: CtaLink;
  secondary?: CtaLink;
}) {
  return (
    <section className="mx-auto max-w-3xl text-center">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-fg sm:text-5xl">
        {title}
      </h1>
      <div className="mt-5 font-reading text-lg leading-relaxed text-muted-fg">{lede}</div>
      {(primary || secondary) && (
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          {primary && (
            <Link
              href={primary.href}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-accent-fg transition-[filter] hover:brightness-105"
            >
              {primary.label}
            </Link>
          )}
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius)] border border-border-strong px-6 text-sm font-medium text-fg transition-colors hover:bg-surface-2"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

export function LandingSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-semibold text-fg">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-fg">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function LandingBooks({
  title,
  subtitle,
  books,
}: {
  title: string;
  subtitle?: string;
  books: Book[];
}) {
  return (
    <LandingSection title={title} subtitle={subtitle}>
      <BookGrid books={books} />
    </LandingSection>
  );
}

/** A short prose passage (the "why this matters" beat) in reading type. */
export function LandingProse({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-semibold text-fg">{title}</h2>
      <div className="mt-4 max-w-2xl space-y-4 font-reading text-lg leading-relaxed text-fg/90">
        {children}
      </div>
    </section>
  );
}

export interface Feature {
  icon: IconType;
  title: string;
  body: string;
}

export function LandingFeatures({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle?: string;
  items: Feature[];
}) {
  return (
    <LandingSection title={title} subtitle={subtitle}>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <div key={f.title} className="rounded-[var(--radius)] border border-border bg-surface p-5">
            <f.icon className="h-6 w-6 text-accent" />
            <h3 className="mt-3 font-display text-lg font-semibold text-fg">{f.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-fg">{f.body}</p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}

export interface Step {
  title: string;
  body: string;
}

/** Numbered how-to steps (used by the install / device pages). */
export function LandingSteps({
  title,
  subtitle,
  steps,
}: {
  title: string;
  subtitle?: string;
  steps: Step[];
}) {
  return (
    <LandingSection title={title} subtitle={subtitle}>
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-[var(--radius)] border border-border bg-surface p-5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 font-display text-sm font-semibold text-accent">
              {i + 1}
            </span>
            <h3 className="mt-3 font-display text-lg font-semibold text-fg">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-fg">{s.body}</p>
          </li>
        ))}
      </ol>
    </LandingSection>
  );
}

export interface Faq {
  q: string;
  a: string;
}

export function LandingFaqs({ title = "Questions, answered", items }: { title?: string; items: Faq[] }) {
  return (
    <LandingSection title={title}>
      <div className="divide-y divide-border overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
        {items.map((f) => (
          <details key={f.q} className="group px-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-base font-medium text-fg [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-fg transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
            </summary>
            <p className="pb-4 text-sm leading-relaxed text-muted-fg">{f.a}</p>
          </details>
        ))}
      </div>
    </LandingSection>
  );
}

export interface RelatedLink {
  href: string;
  label: string;
}

export function LandingRelated({
  title = "Keep exploring",
  links,
}: {
  title?: string;
  links: RelatedLink[];
}) {
  return (
    <LandingSection title={title}>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border border-border px-4 py-1.5 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </LandingSection>
  );
}

export function LandingCta({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <section className="mx-auto mt-16 max-w-2xl rounded-[var(--radius)] border border-border bg-surface-2 p-8 text-center">
      <h2 className="font-display text-2xl font-semibold text-fg">{title}</h2>
      <p className="mt-2 font-reading text-muted-fg">{body}</p>
      <Link
        href={href}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-[var(--radius)] bg-accent px-6 text-sm font-medium text-accent-fg transition-[filter] hover:brightness-105"
      >
        {label}
      </Link>
    </section>
  );
}
