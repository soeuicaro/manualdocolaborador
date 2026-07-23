/* ============================================================
   4JURIS Pessoas · UI kit (Tailwind)
   ============================================================ */
import { type ReactNode, type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
import * as Icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/* ---------- Ícone dinâmico por nome ---------- */
export function Icon({ name, className }: { name: string; className?: string }) {
  const C = (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Circle
  return <C className={className} />
}

/* ---------- Button ---------- */
type BtnVariant = 'primary' | 'ink' | 'ghost' | 'soft' | 'danger' | 'subtle'
type BtnSize = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-brand text-white shadow-brand hover:bg-brand-600',
  ink: 'bg-ink text-white hover:bg-ink-soft',
  ghost: 'bg-surface text-ink border border-line hover:bg-surface-2 hover:border-line-strong',
  soft: 'bg-brand-100 text-brand-700 hover:bg-brand-200',
  danger: 'bg-danger-soft text-danger hover:bg-[#f8d5d3]',
  subtle: 'bg-transparent text-muted hover:bg-winter hover:text-ink',
}
const btnSizes: Record<BtnSize, string> = {
  sm: 'h-9 px-3 text-[12.5px] gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-[13.5px] gap-2 rounded-xl',
  lg: 'h-12 px-6 text-[14.5px] gap-2 rounded-xl',
  icon: 'h-10 w-10 rounded-xl',
  'icon-sm': 'h-9 w-9 rounded-lg',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: BtnSize
  icon?: string
  children?: ReactNode
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', icon, className, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center font-semibold whitespace-nowrap transition active:translate-y-px disabled:opacity-50 disabled:pointer-events-none',
        btnVariants[variant], btnSizes[size], className,
      )}
      {...props}
    >
      {icon && <Icon name={icon} className={size === 'sm' || size === 'icon-sm' ? 'h-4 w-4' : 'h-[17px] w-[17px]'} />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'

/* ---------- Badge ---------- */
const tones: Record<string, string> = {
  brand: 'bg-brand-100 text-brand-700',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-winter text-ink-2',
  gold: 'bg-gold-soft text-gold',
}
export function Badge({ tone = 'neutral', dot, children, className }: { tone?: string; dot?: boolean; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[11.5px] font-semibold px-2.5 py-1 rounded-full leading-none', tones[tone] ?? tones.neutral, className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

/* ---------- Card ---------- */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card', className)}>{children}</div>
}
export function CardHead({ title, sub, action }: { title: ReactNode; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line">
      <div>
        <h3 className="text-[15px] font-bold text-ink">{title}</h3>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

/* ---------- Avatar ---------- */
const avSizes: Record<string, string> = { sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-[13px]', lg: 'h-14 w-14 text-[19px]', xl: 'h-20 w-20 text-[27px]' }
export function Avatar({ nome, cor, size = 'md', className }: { nome: string; cor?: string; size?: keyof typeof avSizes; className?: string }) {
  const p = nome.trim().split(/\s+/)
  const ini = ((p[0]?.[0] || '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase()
  return (
    <div className={cn('flex items-center justify-center rounded-full font-bold text-white shrink-0', avSizes[size], className)} style={{ background: cor ?? '#0032D2' }}>
      {ini}
    </div>
  )
}

/* ---------- ProgressBar ---------- */
export function Progress({ value, className, barClassName, color }: { value: number; className?: string; barClassName?: string; color?: string }) {
  return (
    <div className={cn('h-2 rounded-full bg-winter overflow-hidden', className)}>
      <div className={cn('h-full rounded-full bg-brand transition-all duration-500', barClassName)} style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  )
}

/* ---------- StatCard ---------- */
export function StatCard({ icon, tone = 'brand', value, label, trend }: { icon: string; tone?: string; value: ReactNode; label: string; trend?: ReactNode }) {
  const iconTones: Record<string, string> = {
    brand: 'bg-brand-100 text-brand', success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning', ink: 'bg-winter text-ink', danger: 'bg-danger-soft text-danger',
  }
  return (
    <Card className="p-5 relative overflow-hidden">
      {trend && <div className="absolute top-5 right-5 text-[11.5px] font-bold">{trend}</div>}
      <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center mb-4', iconTones[tone])}>
        <Icon name={icon} className="h-[21px] w-[21px]" />
      </div>
      <div className="text-[28px] font-extrabold tracking-tight text-ink leading-none">{value}</div>
      <div className="text-[12.5px] text-muted mt-2 font-medium">{label}</div>
    </Card>
  )
}

/* ---------- PageHeader ---------- */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap mb-6">
      <div>
        <h1 className="text-[23px] font-bold text-ink tracking-tight">{title}</h1>
        {subtitle && <p className="text-[13.5px] text-muted mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2.5 flex-wrap">{actions}</div>}
    </div>
  )
}

/* ---------- EmptyState ---------- */
export function EmptyState({ icon = 'Inbox', title, desc, action }: { icon?: string; title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="h-14 w-14 rounded-2xl bg-winter flex items-center justify-center mx-auto mb-4">
        <Icon name={icon} className="h-6 w-6 text-muted-2" />
      </div>
      <h3 className="text-base font-bold text-ink mb-1.5">{title}</h3>
      {desc && <p className="text-[13.5px] text-muted max-w-sm mx-auto mb-4">{desc}</p>}
      {action}
    </div>
  )
}

/* ---------- Field ---------- */
export function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="label">{label}{required && <span className="text-danger ml-0.5">*</span>}</label>
      {children}
      {hint && <p className="text-[11.5px] text-muted mt-1.5">{hint}</p>}
    </div>
  )
}

/* ---------- Tabs ---------- */
export function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div className="flex gap-1 border-b border-line mb-6 overflow-x-auto">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn('px-3.5 py-3 text-[13.5px] font-semibold border-b-2 -mb-px transition whitespace-nowrap',
            active === t.key ? 'text-brand border-brand' : 'text-muted border-transparent hover:text-ink')}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- Toggle ---------- */
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <span className={cn('relative w-10 h-[23px] rounded-full transition', checked ? 'bg-brand' : 'bg-platinum')}>
        <span className={cn('absolute top-[3px] left-[3px] h-[17px] w-[17px] rounded-full bg-white shadow-xs transition-transform', checked && 'translate-x-[17px]')} />
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      </span>
      {label && <span className="text-[13px] text-ink-2 font-medium">{label}</span>}
    </label>
  )
}
