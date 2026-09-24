import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    bootstrap: typeof import('bootstrap');
  }
}

type BootstrapModalInstance = InstanceType<typeof import('bootstrap').Modal>;

export const useBootstrapModal = (modalRef: React.RefObject<HTMLDivElement>) => {
  const modalInstanceRef = useRef<BootstrapModalInstance | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const loadBootstrap = () => {
      import('bootstrap/dist/js/bootstrap.bundle.min.js')
        .then(() => {
          setTimeout(initializeModal, 100);
        })
        .catch(() => {
          const existingScript = document.querySelector('script[data-bootstrap-loaded]');
          if (!existingScript) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
            script.integrity = 'sha384-geWF76RCwLtnZ8qwWowPQNguL3RmwHVBC9FhGdlKrxdiJJigb/j/68SIy3Te4Bkz';
            script.crossOrigin = 'anonymous';
            script.async = true;
            script.setAttribute('data-bootstrap-loaded', 'true');

            script.onload = () => {
              setTimeout(initializeModal, 100);
            };

            script.onerror = () => {
              console.warn('Bootstrap failed to load, modal will use fallback');
            };

            document.head.appendChild(script);
            return;
          }

          setTimeout(initializeModal, 100);
        });
    };

    const initializeModal = () => {
      if (!modalRef.current) {
        return;
      }

      let attempts = 0;
      const maxAttempts = 20;
      const tryInit = () => {
        const bootstrap = window.bootstrap;
        if (bootstrap && bootstrap.Modal && modalRef.current) {
          try {
            modalInstanceRef.current = bootstrap.Modal.getOrCreateInstance(modalRef.current, {
              backdrop: 'static'
            });
            
            modalRef.current?.addEventListener('hidden.bs.modal', () => {
              const backdrop = document.getElementById('vehicleModalBackdrop');
              if (backdrop) {
                backdrop.remove();
              }
              document.body.classList.remove('modal-open');
            });
          } catch (error) {
            console.error('Error initializing modal:', error);
          }
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(tryInit, 50);
          }
        }
      };
      tryInit();
    };

    loadBootstrap();

    return () => {
      if (modalInstanceRef.current) {
        try {
          modalInstanceRef.current.hide();
          modalInstanceRef.current.dispose();
        } catch (error) {
          console.error('Error disposing modal:', error);
        }
        modalInstanceRef.current = null;
      }
      const backdrop = document.getElementById('vehicleModalBackdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
    };
  }, [modalRef]);

  const showModal = () => {
    if (typeof window === 'undefined' || !modalRef.current) {
      return;
    }

    const bootstrap = window.bootstrap;
    if (bootstrap && bootstrap.Modal && modalInstanceRef.current) {
      try {
        modalInstanceRef.current.show();
        return;
      } catch (error) {
        console.error('Error showing modal with Bootstrap:', error);
      }
    }

    // Fallback: manually show modal
    if (!modalRef.current) {
      return;
    }

    modalRef.current.classList.add('show');
    modalRef.current.style.display = 'block';
    modalRef.current.setAttribute('aria-hidden', 'false');
    modalRef.current.setAttribute('aria-modal', 'true');
    document.body.classList.add('modal-open');
    
    const existingBackdrop = document.getElementById('vehicleModalBackdrop');
    if (existingBackdrop) {
      existingBackdrop.remove();
    }
    
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop fade show';
    backdrop.id = 'vehicleModalBackdrop';
    document.body.appendChild(backdrop);
  };

  const hideModal = () => {
    if (modalInstanceRef.current) {
      try {
        modalInstanceRef.current.hide();
      } catch (error) {
        console.error('Error hiding modal:', error);
        if (modalRef.current) {
          modalRef.current.classList.remove('show');
          modalRef.current.style.display = 'none';
          modalRef.current.setAttribute('aria-hidden', 'true');
          modalRef.current.removeAttribute('aria-modal');
          document.body.classList.remove('modal-open');
          const backdrop = document.getElementById('vehicleModalBackdrop');
          if (backdrop) {
            backdrop.remove();
          }
        }
      }
    } else {
      if (modalRef.current) {
        modalRef.current.classList.remove('show');
        modalRef.current.style.display = 'none';
        modalRef.current.setAttribute('aria-hidden', 'true');
        modalRef.current.removeAttribute('aria-modal');
        document.body.classList.remove('modal-open');
        const backdrop = document.getElementById('vehicleModalBackdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }
    }
  };

  return { showModal, hideModal };
};

