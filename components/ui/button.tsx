"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAlreadySubmittedNotice } from "@/components/already-submitted-context"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "liquid-glass-surface text-slate-900 shadow-sm hover:shadow-md border border-white/20",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    /**
     * Estado de "em andamento" controlado externamente (ex.: `isPending` de uma
     * mutation). Desabilita o botão e exibe um spinner. Combine com a trava
     * automática de `onClick` async para defesa em profundidade.
     */
    pending?: boolean
  }

/**
 * Botão base do design system.
 *
 * Previne double-submit (duplo-clique): quando o `onClick` retorna uma `Promise`,
 * o botão se auto-desabilita de forma síncrona (via ref) até a Promise resolver,
 * descartando cliques subsequentes. Para handlers que não retornam Promise, use
 * a prop `pending` ou o hook `useSubmitGuard`. Não interfere em botões síncronos.
 */
function Button({
  className,
  variant,
  size,
  asChild = false,
  pending = false,
  onClick,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  const lockRef = React.useRef(false)
  const [internalPending, setInternalPending] = React.useState(false)
  const notice = useAlreadySubmittedNotice()
  const noticeRef = React.useRef(notice)
  noticeRef.current = notice

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      // Trava síncrona: descarta o segundo clique antes de qualquer side-effect
      // e avisa o usuário que a ação já está em andamento ("item já enviado").
      if (lockRef.current) {
        event.preventDefault()
        noticeRef.current.notify()
        return
      }
      if (!onClick) return

      const result = onClick(event) as unknown
      if (result instanceof Promise) {
        lockRef.current = true
        setInternalPending(true)
        result.finally(() => {
          lockRef.current = false
          setInternalPending(false)
        })
      }
    },
    [onClick]
  )

  const isBusy = pending || internalPending
  const isDisabled = disabled || isBusy

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      onClick={handleClick}
      disabled={isDisabled}
      aria-busy={isBusy || undefined}
      {...props}
    >
      {isBusy && !asChild ? (
        <Loader2 className="animate-spin" aria-hidden />
      ) : null}
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
