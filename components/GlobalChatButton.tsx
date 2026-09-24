"use client";

import React, { useEffect, useState, lazy, Suspense } from 'react';
import { MessageSquare } from 'lucide-react';

// Lazy load do componente de chat para garantir que CSS esteja carregado
const VendorVoiceChat = lazy(() => 
  import('@/app/(private)/home/components/VendorVoiceChat').then(module => ({
    default: module.VendorVoiceChat
  }))
);

// Função para verificar se o CSS está carregado
function checkCSSReady(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // Se o documento já está completamente carregado, verifica imediatamente
    if (document.readyState === 'complete') {
      // Aguarda um frame para garantir que CSS foi processado
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve(verifyStyles());
        });
      });
      return;
    }

    // Aguarda o documento estar pronto
    const checkOnLoad = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          resolve(verifyStyles());
        });
      });
    };

    if (document.readyState === 'loading') {
      window.addEventListener('load', checkOnLoad, { once: true });
    } else {
      checkOnLoad();
    }
  });
}

// Função auxiliar para verificar estilos
function verifyStyles(): boolean {
  try {
    // Verifica se os estilos críticos do Dialog estão disponíveis
    const testElement = document.createElement('div');
    testElement.className = 'fixed left-[50%] top-[50%] z-50';
    testElement.style.display = 'none';
    testElement.style.visibility = 'hidden';
    testElement.style.position = 'absolute';
    document.body.appendChild(testElement);

    const styles = window.getComputedStyle(testElement);
    const hasPosition = styles.position === 'fixed' || styles.position === 'absolute';
    const hasZIndex = styles.zIndex !== 'auto' && parseInt(styles.zIndex) >= 0;
    
    document.body.removeChild(testElement);

    // Verifica também se as classes Tailwind estão disponíveis
    const tailwindTest = document.createElement('div');
    tailwindTest.className = 'max-w-6xl w-full h-[90vh] flex flex-col bg-white';
    tailwindTest.style.display = 'none';
    tailwindTest.style.visibility = 'hidden';
    document.body.appendChild(tailwindTest);
    
    const tailwindStyles = window.getComputedStyle(tailwindTest);
    const hasMaxWidth = tailwindStyles.maxWidth !== 'none' && tailwindStyles.maxWidth !== '';
    const hasFlex = tailwindStyles.display === 'flex';
    const hasBg = tailwindStyles.backgroundColor !== 'rgba(0, 0, 0, 0)' && tailwindStyles.backgroundColor !== 'transparent';
    
    document.body.removeChild(tailwindTest);

    // Verifica se pelo menos os estilos básicos estão disponíveis
    return (hasPosition && hasZIndex) || (hasMaxWidth && hasFlex && hasBg);
  } catch (error) {
    console.warn('Error verifying CSS:', error);
    // Em caso de erro, assume que está pronto (fallback)
    return true;
  }
}

export function GlobalChatButton() {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [unreadTotal, setUnreadTotal] = useState<number>(0);
  const [initialUserId, setInitialUserId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [cssReady, setCssReady] = useState<boolean>(false);
  const [pendingOpen, setPendingOpen] = useState<boolean>(false);

  const handleChatClose = (open: boolean) => {
    setIsChatOpen(open);
    if (!open) {
      setInitialUserId(null);
      setPendingOpen(false);
    }
  };

  const handleOpenChat = () => {
    setInitialUserId(null);
    if (cssReady) {
      setIsChatOpen(true);
    } else {
      setPendingOpen(true);
      // Aguarda o CSS estar pronto antes de abrir
      checkCSSReady().then((ready) => {
        if (ready) {
          setCssReady(true);
          setIsChatOpen(true);
        }
      });
    }
  };

  useEffect(() => {
    const handleUnread = (event: Event) => {
      const detail = (event as CustomEvent).detail as { total?: number };
      setUnreadTotal(Number(detail?.total ?? 0));
    };
    window.addEventListener('chat-unread-changed', handleUnread);
    return () => {
      window.removeEventListener('chat-unread-changed', handleUnread);
    };
  }, []);

  useEffect(() => {
    const handleOpenWithUser = async (event: Event) => {
      const detail = (event as CustomEvent).detail as { userId?: number };
      const userId = detail?.userId;
      if (typeof userId === 'number') {
        setInitialUserId(userId);
        if (cssReady) {
          setIsChatOpen(true);
        } else {
          setPendingOpen(true);
          const ready = await checkCSSReady();
          if (ready) {
            setCssReady(true);
            setIsChatOpen(true);
          }
        }
      }
    };
    window.addEventListener('chat-open-with-user', handleOpenWithUser);
    return () => {
      window.removeEventListener('chat-open-with-user', handleOpenWithUser);
    };
  }, [cssReady]);

  // Garantir que o componente está montado no cliente e CSS está pronto
  useEffect(() => {
    setIsMounted(true);
    
    // Verifica se o CSS está pronto quando o componente monta
    checkCSSReady().then((ready) => {
      setCssReady(ready);
    });
  }, []);

  // Abre a modal quando CSS estiver pronto e houver abertura pendente
  useEffect(() => {
    if (cssReady && pendingOpen) {
      setIsChatOpen(true);
      setPendingOpen(false);
    }
  }, [cssReady, pendingOpen]);

  return (
    <>
      {/* Botão Flutuante do Chat */}
      <div className="fixed bottom-6 right-6 z-50 max-md:bottom-[5.75rem] max-md:right-5">
        <div className="relative">
          <button
            type="button"
            onClick={handleOpenChat}
            className="relative overflow-hidden rounded-full w-16 h-16 inline-flex items-center justify-center transition-transform duration-180 ease-in-out outline-none hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98] focus-visible:shadow-[0_0_0_4px_rgba(59,130,246,0.25),0_22px_54px_rgba(15,23,42,0.22)]"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(99, 102, 241, 0.14) 45%, rgba(255, 255, 255, 0.06) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              backdropFilter: 'blur(18px) saturate(180%)',
              WebkitBackdropFilter: 'blur(18px) saturate(180%)',
              boxShadow: '0 18px 42px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.10) inset, 0 10px 24px rgba(0, 0, 0, 0.10), 0 0 0 6px rgba(59, 130, 246, 0.05)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.24) 0%, rgba(99, 102, 241, 0.18) 45%, rgba(255, 255, 255, 0.08) 100%)';
              e.currentTarget.style.boxShadow = '0 22px 54px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(255, 255, 255, 0.14) inset, 0 12px 28px rgba(0, 0, 0, 0.12), 0 0 0 6px rgba(59, 130, 246, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.18) 0%, rgba(99, 102, 241, 0.14) 45%, rgba(255, 255, 255, 0.06) 100%)';
              e.currentTarget.style.boxShadow = '0 18px 42px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.10) inset, 0 10px 24px rgba(0, 0, 0, 0.10), 0 0 0 6px rgba(59, 130, 246, 0.05)';
            }}
            aria-label="Abrir chat"
          >
            <span className="sr-only">Abrir chat</span>

            {/* Ícone */}
            <MessageSquare className="relative z-2 w-7 h-7" style={{ color: 'rgba(37, 99, 235, 0.95)', filter: 'drop-shadow(0 10px 18px rgba(15, 23, 42, 0.22))' }} />
          </button>
          {unreadTotal > 0 && (
            <span
              className="absolute top-[-2px] right-[-2px] min-w-[22px] h-[22px] px-[6px] rounded-full inline-flex items-center justify-center pointer-events-none z-10"
              style={{
                background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)',
                border: '2px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.25)',
              }}
              aria-label="Unread messages"
            >
              <span className="text-[10px] leading-1 font-extrabold text-white" style={{ lineHeight: 1 }}>{unreadTotal > 99 ? "99+" : unreadTotal}</span>
            </span>
          )}
        </div>
      </div>

      {/* Modal do Chat - Lazy loaded com Suspense */}
      {isMounted && (
        <Suspense fallback={null}>
          <VendorVoiceChat 
            open={isChatOpen} 
            onOpenChange={handleChatClose}
            initialUserId={initialUserId ?? undefined}
          />
        </Suspense>
      )}
    </>
  );
}
