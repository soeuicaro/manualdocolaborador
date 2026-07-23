import { type ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

export function Modal({
  open, onClose, title, subtitle, children, footer, wide,
}: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-[200] bg-ink/40 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto flex items-start justify-center animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={cn('bg-surface rounded-3xl shadow-lg w-full my-auto animate-scale-in', wide ? 'max-w-3xl' : 'max-w-lg')}>
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
            <div>
              {title && <h2 className="text-[19px] font-bold text-ink">{title}</h2>}
              {subtitle && <p className="text-[13px] text-muted mt-1">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="h-9 w-9 shrink-0 rounded-lg border border-line text-muted hover:bg-winter hover:text-ink flex items-center justify-center transition">
              <X className="h-[18px] w-[18px]" />
            </button>
          </div>
        )}
        <div className="px-6 pb-2 max-h-[64vh] overflow-y-auto">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2.5 px-6 py-5 border-t border-line mt-3">{footer}</div>}
      </div>
    </div>
  )
}
