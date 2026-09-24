'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  AlreadySubmittedContext,
  type AlreadySubmittedNotice,
} from '@/components/already-submitted-context';

export {
  useAlreadySubmittedNotice,
  type AlreadySubmittedNotice,
} from '@/components/already-submitted-context';

/** Mensagem padrão exibida quando um clique reentrante é descartado. */
const DEFAULT_TITLE = 'Item já enviado';
const DEFAULT_DESCRIPTION =
  'Esta ação já está sendo processada. Aguarde a conclusão antes de tentar novamente.';

/**
 * Provider do aviso global de "item já enviado". Monte uma única vez perto da raiz
 * (ex.: nos Providers da aplicação). Renderiza uma única `Dialog` compartilhada que
 * qualquer `Button`/`useSubmitGuard` aciona ao descartar um clique duplicado.
 */
export function AlreadySubmittedProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState<{
    title: string;
    description: string;
  }>({ title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION });

  const notify = React.useCallback<AlreadySubmittedNotice['notify']>((custom) => {
    setMessage({
      title: custom?.title ?? DEFAULT_TITLE,
      description: custom?.description ?? DEFAULT_DESCRIPTION,
    });
    setOpen(true);
  }, []);

  // `notify` é estável (useCallback []), então o value não recria a cada render.
  const value = React.useMemo<AlreadySubmittedNotice>(() => ({ notify }), [notify]);

  return (
    <AlreadySubmittedContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{message.title}</DialogTitle>
            <DialogDescription>{message.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} className="w-full sm:w-auto">
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AlreadySubmittedContext.Provider>
  );
}
