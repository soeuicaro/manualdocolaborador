import { create } from 'zustand'
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { uid } from '@/lib/utils'

type ToastType = 'success' | 'danger' | 'info'
interface Toast { id: string; type: ToastType; msg: string }

interface ToastState {
  toasts: Toast[]
  push: (msg: string, type?: ToastType) => void
  remove: (id: string) => void
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (msg, type = 'success') => {
    const id = uid('t')
    set((s) => ({ toasts: [...s.toasts, { id, msg, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000)
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Helper para chamar fora de componentes: toast('...') */
export const toast = (msg: string, type: ToastType = 'success') => useToast.getState().push(msg, type)

const icons = { success: CheckCircle2, danger: AlertTriangle, info: Info }
const accent = { success: 'text-[#4ade9b]', danger: 'text-[#ff8a82]', info: 'text-brand-300' }

export function ToastHost() {
  const toasts = useToast((s) => s.toasts)
  return (
    <div className="fixed bottom-5 right-5 z-[300] flex flex-col gap-2.5">
      {toasts.map((t) => {
        const I = icons[t.type]
        return (
          <div key={t.id} className="flex items-center gap-3 bg-ink text-white px-4 py-3 rounded-xl shadow-md text-[13.5px] font-medium min-w-[260px] max-w-sm animate-slide-up">
            <I className={`h-[19px] w-[19px] shrink-0 ${accent[t.type]}`} />
            <span>{t.msg}</span>
          </div>
        )
      })}
    </div>
  )
}
