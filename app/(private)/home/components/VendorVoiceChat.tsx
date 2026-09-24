"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Send, Loader2, User, MessageSquare, Search, Paperclip, X, FileText, Download, ChevronLeft, Check, CheckCheck, AlertCircle } from 'lucide-react';
import { format, isToday, isYesterday } from "date-fns";
import { fetchChatUsers, type ChatUser } from '@/lib/chat-users-api';
import {
  type ChatMessage,
  type UnreadSummaryItem,
  type ChatConversation,
  type MessageViewer,
  getOrCreateDirectConversation,
  getOrCreateGlobalGroupConversation,
  fetchConversationMessages,
  fetchUnreadSummary,
  fetchUnreadCount,
  markConversationSeen,
  getUploadUrl,
  uploadFileToGcs,
  fetchMessageViewers,
} from '@/lib/chat-conversations-api';
import { getUserIdFromToken, getUserTypeFromToken } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { useIsMobile } from "@/hooks/use-mobile";
import { mobileChatStyles } from "@/components/mobile-chat-styles";
import { useSocket, resetSocket } from "@/hooks/use-socket";

interface VendorVoiceChatProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se definido, ao abrir o modal abre a conversa com este utilizador (ex.: a partir da página de pedidos admin). */
  initialUserId?: number;
}

function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function dayLabel(date: Date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MM/dd/yyyy");
}

export const VendorVoiceChat: React.FC<VendorVoiceChatProps> = ({ open, onOpenChange, initialUserId }) => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<ChatConversation | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mobileView, setMobileView] = useState<'vendors' | 'chat'>('vendors');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notificationsPreviewEnabled, setNotificationsPreviewEnabled] = useState<boolean>(false);
  const [unreadByUserId, setUnreadByUserId] = useState<Record<number, number>>({});
  const [lastMessageByUserId, setLastMessageByUserId] = useState<Record<number, ChatMessage>>({});
  const [unreadByConversationId, setUnreadByConversationId] = useState<Record<string, number>>({});
  const [lastMessageByConversationId, setLastMessageByConversationId] = useState<Record<string, ChatMessage>>({});
  const [globalGroupId, setGlobalGroupId] = useState<string | null>(null);
  const [viewersModalOpen, setViewersModalOpen] = useState(false);
  const [messageViewers, setMessageViewers] = useState<MessageViewer[]>([]);
  const [loadingViewers, setLoadingViewers] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = getUserIdFromToken();
  const currentUserTypeId = getUserTypeFromToken();
  const isMobile = useIsMobile();
  // Rastreia se a modal já foi aberta pela primeira vez
  const [hasBeenOpened, setHasBeenOpened] = useState<boolean>(false);
  // Conecta ao socket apenas quando a modal for aberta pela primeira vez
  const socket = useSocket(hasBeenOpened);

  // Verifica se o vendor está no grupo News (somente leitura para vendors)
  const isVendorInNewsGroup = currentUserTypeId === 2 && selectedGroup?.groupName === "News";

  // Garantir que isMobile seja false no desktop na primeira renderização
  // useIsMobile retorna undefined inicialmente, então assumimos desktop até confirmar
  const [isMobileSafe, setIsMobileSafe] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobileSafe(isMobile);
    }
  }, [isMobile]);


  const markSeen = useCallback(
    async (seenAt?: string) => {
      if (!conversationId) return;
      const payload = { 
        conversationId, 
        seenAt: seenAt || new Date().toISOString(),
        // Backward compatibility
        conversation_id: conversationId,
        seen_at: seenAt || new Date().toISOString()
      };
      try {
        if (socket) {
          socket.emit('conversation:seen', payload);
        } else {
          await markConversationSeen(conversationId, payload.seenAt);
        }
      } catch (err) {
        console.warn('Failed to mark conversation seen:', err);
      }
    },
    [socket, conversationId]
  );

  // Preferência de notificação (preview on/off)
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('chat_notifications_preview_enabled');
      if (saved === 'true') setNotificationsPreviewEnabled(true);
      if (saved === 'false') setNotificationsPreviewEnabled(false);
    } catch {
      // ignore
    }
  }, []);

  const clearUnreadForUser = useCallback((userId: number) => {
    setUnreadByUserId(prev => {
      if (!prev[userId]) return prev;
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  const setLastMessageForUser = useCallback((userId: number, message: ChatMessage) => {
    setLastMessageByUserId(prev => ({ ...prev, [userId]: message }));
  }, []);

  const applyUnreadSummary = useCallback(
    (items: UnreadSummaryItem[]) => {
      const nextUnread: Record<number, number> = {};
      const nextLast: Record<number, ChatMessage> = {};
      const nextUnreadConv: Record<string, number> = {};
      const nextLastConv: Record<string, ChatMessage> = {};

      items.forEach((item) => {
        if (item.peerUserId) {
          // Conversa direta
          if (item.unreadCount > 0) {
            nextUnread[item.peerUserId] = item.unreadCount;
          }
          if (item.lastMessage) {
            nextLast[item.peerUserId] = item.lastMessage;
          }
        } else if (item.conversationId) {
          // Conversa de grupo
          if (item.unreadCount > 0) {
            nextUnreadConv[item.conversationId] = item.unreadCount;
          }
          if (item.lastMessage) {
            nextLastConv[item.conversationId] = item.lastMessage;
          }
        }
      });

      setUnreadByUserId(nextUnread);
      setLastMessageByUserId((prev) => ({ ...prev, ...nextLast }));
      setUnreadByConversationId((prev) => ({ ...prev, ...nextUnreadConv }));
      setLastMessageByConversationId((prev) => ({ ...prev, ...nextLastConv }));

      // Se encontrou uma conversa de grupo "News", armazena o ID
      const globalGroup = items.find(
        (item) => item.conversationId && !item.peerUserId
      );
      if (globalGroup?.conversationId && !globalGroupId) {
        // Verifica se é realmente o grupo "News" buscando nas conversas
        // Por enquanto, assumimos que qualquer grupo sem peerUserId pode ser o global
        setGlobalGroupId(globalGroup.conversationId);
      }
    },
    [globalGroupId]
  );

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, selectedUser]);

  // Escuta novas mensagens via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const handleConversationSeen = (payload: { conversationId: string; userId: number; seenAt: string }) => {
      if (!conversationId || payload.conversationId !== conversationId) return;
      if (currentUserId === null || payload.userId === currentUserId) return;

      const seenTime = new Date(payload.seenAt).getTime();
      setMessages(prev =>
        prev.map((message) => {
          if (message.senderId !== currentUserId) return message;
          const messageTime = new Date(message.createdAt).getTime();
          if (messageTime <= seenTime) {
            return { ...message, readByOthers: true };
          }
          return message;
        })
      );
    };

    const handleNewMessage = (newMessage: ChatMessage) => {
      const matchesConversation = conversationId && newMessage.conversationId === conversationId;
      const matchesSelectedUser =
        !!selectedUser &&
        (newMessage.senderId === selectedUser.userId ||
          (currentUserId !== null && newMessage.senderId === currentUserId));
      const matchesSelectedGroup = !!selectedGroup && newMessage.conversationId === selectedGroup.id;
      const isFromMe = currentUserId !== null && newMessage.senderId === currentUserId;
      const isActiveConversation = Boolean(matchesConversation && open);

      if (!isFromMe) {
        // Atualiza última mensagem para conversas diretas
        if (selectedUser) {
          setLastMessageForUser(newMessage.senderId, newMessage);
        }
        // Atualiza última mensagem para conversas de grupo
        if (selectedGroup || !selectedUser) {
          setLastMessageByConversationId(prev => ({
            ...prev,
            [newMessage.conversationId]: newMessage
          }));
        }

        // Atualiza o unread summary do backend (que já incrementou o unread)
        // Isso evita duplicação, pois o backend já incrementou via bumpUnreadForUser
        if (!isActiveConversation) {
          fetchUnreadSummary()
            .then(applyUnreadSummary)
            .catch(err => console.warn('Failed to refresh unread summary:', err));
          // Atualiza também o total baseado em last_seenAt
          fetchUnreadCount()
            .then(count => {
              window.dispatchEvent(new CustomEvent('chat-unread-changed', { detail: { total: count } }));
            })
            .catch(err => console.warn('Failed to refresh unread count:', err));
        }
      }

      if (!matchesConversation && !matchesSelectedUser && !matchesSelectedGroup) return;

      if (!conversationId) {
        setConversationId(newMessage.conversationId);
        socket.emit('conversation:join', { conversationId: newMessage.conversationId });
      }

      setMessages(prev => {
        const exists = prev.some(msg => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      if (
        matchesConversation &&
        open &&
        currentUserId !== null &&
        newMessage.senderId !== currentUserId
      ) {
        markSeen(newMessage.createdAt);
        if (selectedUser) {
          clearUnreadForUser(newMessage.senderId);
        }
        if (selectedGroup) {
          setUnreadByConversationId(prev => {
            const next = { ...prev };
            delete next[newMessage.conversationId];
            return next;
          });
        }
        // Atualiza o total de não lidas quando marca como vista
        fetchUnreadCount()
          .then(count => {
            window.dispatchEvent(new CustomEvent('chat-unread-changed', { detail: { total: count } }));
          })
          .catch(err => console.warn('Failed to refresh unread count:', err));
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('conversation:seen', handleConversationSeen);

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('conversation:seen', handleConversationSeen);
    };
  }, [
    socket,
    conversationId,
    selectedUser,
    selectedGroup,
    currentUserId,
    open,
    markSeen,
    clearUnreadForUser,
    setLastMessageForUser,
    applyUnreadSummary,
  ]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit('conversation:join', { conversationId });
    // Marca a conversa como vista assim que ela é aberta
    markSeen();
  }, [socket, conversationId, markSeen]);

  const openConversation = useCallback(async (user: ChatUser) => {
    try {
      setIsLoading(true);
      setSelectedUser(user);
      setSelectedGroup(null);
      clearUnreadForUser(user.userId);
      const conversation = await getOrCreateDirectConversation(user.userId);
      setConversationId(conversation.id);
      socket?.emit('conversation:join', { conversationId: conversation.id });

      // Marca como vista imediatamente ao abrir a conversa
      await markConversationSeen(conversation.id, new Date().toISOString());

      const msgs = await fetchConversationMessages(conversation.id);
      const ordered = msgs.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(ordered);
      // Atualiza novamente com a última mensagem se houver
      if (ordered.length > 0) {
        markSeen(ordered[ordered.length - 1].createdAt);
      }
      if (isMobileSafe) setMobileView('chat');
    } catch (err) {
      setError('Error opening conversation');
      console.error('Error opening conversation:', err);
    } finally {
      setIsLoading(false);
    }
  }, [socket, isMobileSafe, markSeen, clearUnreadForUser]);

  const openGroupConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      setSelectedUser(null);
      const conversation = await getOrCreateGlobalGroupConversation(users);
      setSelectedGroup(conversation);
      setGlobalGroupId(conversation.id);
      setConversationId(conversation.id);
      socket?.emit('conversation:join', { conversationId: conversation.id });

      // Marca como vista imediatamente ao abrir a conversa
      await markConversationSeen(conversation.id, new Date().toISOString());

      const msgs = await fetchConversationMessages(conversation.id);
      const ordered = msgs.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      setMessages(ordered);
      // Atualiza novamente com a última mensagem se houver
      if (ordered.length > 0) {
        markSeen(ordered[ordered.length - 1].createdAt);
      }
      if (isMobileSafe) setMobileView('chat');

      // Limpa unread para a conversa de grupo
      setUnreadByConversationId(prev => {
        const next = { ...prev };
        delete next[conversation.id];
        return next;
      });
    } catch (err) {
      setError('Error opening group conversation');
      console.error('Error opening group conversation:', err);
    } finally {
      setIsLoading(false);
    }
  }, [socket, isMobileSafe, markSeen, users]);

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const usersList = await fetchChatUsers();
      setUsers(usersList);
      try {
        const unread = await fetchUnreadSummary();
        applyUnreadSummary(unread);
      } catch (err) {
        console.warn('Failed to load unread summary:', err);
      }
      // Carrega o total de mensagens não lidas baseado em last_seenAt
      try {
        const count = await fetchUnreadCount();
        window.dispatchEvent(new CustomEvent('chat-unread-changed', { detail: { total: count } }));
      } catch (err) {
        console.warn('Failed to load unread count:', err);
      }
      // Não seleciona automaticamente um usuário - deixa o usuário escolher
    } catch (err) {
      setError('Error loading users');
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [applyUnreadSummary]);

  useEffect(() => {
    const totalUnread = Object.values(unreadByUserId).reduce((sum, value) => sum + value, 0);
    window.dispatchEvent(new CustomEvent('chat-unread-changed', { detail: { total: totalUnread } }));
  }, [unreadByUserId]);

  // Detecta quando a modal é aberta pela primeira vez para conectar o socket
  useEffect(() => {
    if (open && !hasBeenOpened) {
      setHasBeenOpened(true);
    }
  }, [open, hasBeenOpened]);

  // Reset estado quando a modal fecha
  useEffect(() => {
    if (!open) {
      setSelectedUser(null);
      setSelectedGroup(null);
      setConversationId(null);
      setMessages([]);
      setInputMessage('');
      setSearchQuery('');
      setSelectedFile(null);
      setFilePreview(null);
      setError(null);
      // Não limpa globalGroupId para manter a referência
      if (isMobileSafe) {
        setMobileView('vendors');
      }
    }
  }, [open, isMobileSafe]);

  // Carrega usuários ao abrir o modal; se initialUserId estiver definido, abre a conversa com esse utilizador
  useEffect(() => {
    if (open) {
      // Reset estados antes de carregar
      setSelectedUser(null);
      setSelectedGroup(null);
      setConversationId(null);
      setMessages([]);
      setInputMessage('');
      setSearchQuery('');
      setSelectedFile(null);
      setFilePreview(null);
      setError(null);

      loadUsers();
      if (isMobileSafe) {
        setMobileView('vendors');
      }
    }
  }, [open, isMobileSafe, loadUsers]);

  useEffect(() => {
    if (!open || !initialUserId || users.length === 0) return;
    const user = users.find((u) => u.userId === initialUserId);
    if (user) {
      openConversation(user);
    }
  }, [open, initialUserId, users, openConversation]);

  const setNotificationPreference = (enabled: boolean) => {
    setNotificationsPreviewEnabled(enabled);
    try {
      window.localStorage.setItem('chat_notifications_preview_enabled', String(enabled));
      window.dispatchEvent(new CustomEvent('chat-notification-pref-changed', { detail: { enabled } }));
    } catch {
      // ignore
    }
  };


  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Limita tamanho do arquivo (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Cria preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const addMessage = useCallback((newMessage: ChatMessage) => {
    setMessages(prev => {
      const exists = prev.some(msg => msg.id === newMessage.id);
      if (exists) return prev;
      return [...prev, newMessage].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });
  }, []);

  const sendTextMessage = async () => {
    if ((!selectedUser && !selectedGroup) || !conversationId || (!inputMessage.trim() && !selectedFile)) return;

    try {
      setIsSending(true);

      let fileUrl: string | undefined;
      let messageType: 'text' | 'image' | 'file' = 'text';

      if (selectedFile) {
        const kind = selectedFile.type.startsWith('image/') ? 'image' : 'file';
        messageType = kind === 'image' ? 'image' : 'file';
        const upload = await getUploadUrl({
          conversationId,
          mimeType: selectedFile.type || 'application/octet-stream',
          kind,
        });
        await uploadFileToGcs(upload.uploadUrl, selectedFile);
        fileUrl = upload.fileUrl;
      }

      const content = inputMessage.trim() || undefined;

      if (!socket) {
        throw new Error('Socket not initialized');
      }
      if (!socket.connected) {
        socket.connect();
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('Socket not connected'));
          }, 2500);

          const onConnect = () => {
            cleanup();
            resolve();
          };

          const onConnectError = (err: Error) => {
            if (process.env.NODE_ENV === 'development') {
              console.error('[Chat] Socket connection error:', err.message);
              // Se for erro de autenticação, forçamos o reset do singleton para tentar novamente com novo token
              if (err.message?.toLowerCase().includes('token') || err.message?.toLowerCase().includes('auth')) {
                console.warn('[Chat] Authentication error detected, resetting socket singleton...');
                resetSocket();
              }
            }
            cleanup();
            reject(new Error(err.message || 'Socket connection error'));
          };

          const cleanup = () => {
            clearTimeout(timeout);
            socket.off('connect', onConnect);
            socket.off('connect_error', onConnectError);
          };

          socket.once('connect', onConnect);
          socket.once('connect_error', onConnectError);
        });
      }

      const payload = { conversationId, type: messageType, content, fileUrl };
      await new Promise<void>((resolve, reject) => {
        let done = false;
        const timer = setTimeout(() => {
          if (done) return;
          done = true;
          reject(new Error('Socket send timeout'));
        }, 3000);

        socket.emit('message:send', {
          ...payload,
          // Backward compatibility
          conversation_id: conversationId,
          message_type: messageType,
          file_url: fileUrl
        }, (ack?: { error?: string; message?: ChatMessage }) => {
          if (done) return;
          done = true;
          clearTimeout(timer);
          if (ack?.error) {
            reject(new Error(ack.error));
            return;
          }
          if (ack?.message) addMessage(ack.message);
          resolve();
        });
      });

      setInputMessage('');
      removeSelectedFile();
    } catch (err) {
      setError('Error sending message');
      console.error('Error sending message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const currentConversationMessages = useMemo(() => {
    return messages.slice().sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase().trim();
    return users.filter(user =>
      user.fullName.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-6xl w-full h-[90vh] flex flex-col p-0 overflow-hidden",
          isMobileSafe &&
          "[&>button]:hidden left-0 top-0 translate-x-0 translate-y-0 w-screen h-[100dvh] max-w-none border-0 rounded-none",
          !isMobileSafe && "[&>button]:hidden left-[50%] top-[5%] translate-x-[-50%] translate-y-0 rounded-2xl"
        )}
        style={!isMobileSafe ? {
          left: '50%',
          top: '5%',
          transform: 'translateX(-50%) translateY(0)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.20) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2) inset, 0 8px 32px rgba(15, 23, 42, 0.12)',
          color: '#0f172a',
          position: 'fixed',
          zIndex: 50
        } as React.CSSProperties : isMobileSafe ? {
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.20) 0%, rgba(255, 255, 255, 0.12) 50%, rgba(255, 255, 255, 0.18) 100%)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: 'none',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(255, 255, 255, 0.25) inset',
        } as React.CSSProperties : undefined}
      >
        {/* helpers: esconder scrollbar do chat no WebKit (mobile) */}
        {isMobileSafe && (
          <style jsx global>{`
            .${mobileChatStyles.messagesAreaWebkit}::-webkit-scrollbar {
              width: 0;
              height: 0;
            }
          `}</style>
        )}

        <DialogHeader className={cn("px-6 pt-6 pb-4", isMobileSafe && "hidden")}>
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-slate-900 mb-1">
                Chat
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                Start a conversation with users
              </DialogDescription>
            </div>

            <div className="flex items-center gap-4">
              {/* Preferência de notificação */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-700">Notification preview</span>
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notificationsPreviewEnabled}
                    onChange={(e) => setNotificationPreference(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/30"
                    aria-label="Toggle notification preview"
                  />
                  <span className="text-sm text-slate-600">
                    {notificationsPreviewEnabled ? 'On' : 'Off'}
                  </span>
                </label>
              </div>
              {/* Botão de fechar */}
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div
          className={cn("flex flex-1 overflow-hidden", isMobileSafe && "px-4 pt-4 pb-5")}
          onPointerDown={(e) => {
            // Mobile é full-screen: fecha ao tocar na área "vazia" fora do card
            if (!isMobileSafe) return;
            if (e.target === e.currentTarget) onOpenChange(false);
          }}
        >
          {/* Lista de Users */}
          {(!isMobileSafe || mobileView === 'vendors') && (
            <div
              className={cn(
                "w-80 border-r flex flex-col",
                isMobileSafe &&
                "w-full border-r-0 rounded-3xl ring-1 ring-white/40 shadow-[0_20px_45px_rgba(15,23,42,0.12)] overflow-hidden"
              )}
              style={isMobileSafe ? {
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.20) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              } : {
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.40) 0%, rgba(255, 255, 255, 0.30) 100%)',
                backdropFilter: 'blur(12px) saturate(160%)',
                WebkitBackdropFilter: 'blur(12px) saturate(160%)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              {isMobileSafe && (
                <div className="p-4 flex items-center justify-between">
                  <div className="font-semibold text-slate-900">Users</div>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="h-9 w-9 rounded-full ring-1 ring-white/40 grid place-items-center text-slate-700 transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.40) 100%)',
                      backdropFilter: 'blur(10px) saturate(150%)',
                      WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.55) 100%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.40) 100%)';
                    }}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-base mb-3 text-slate-900">Groups</h3>
                <button
                  onClick={openGroupConversation}
                  className={cn(
                    "w-full text-left p-3 rounded-lg mb-1 transition-all duration-200",
                    selectedGroup
                      ? "bg-blue-500/90 text-white"
                      : "hover:bg-white/40 bg-white/25"
                  )}
                  style={!selectedGroup ? {
                    backdropFilter: 'blur(8px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(8px) saturate(140%)',
                  } : undefined}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="min-w-0 flex items-center gap-2 flex-1">
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span className="font-medium text-sm truncate">News</span>
                    </div>
                    {globalGroupId && unreadByConversationId[globalGroupId] > 0 && (
                      <span
                        className={cn(
                          "ml-2 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center shrink-0",
                          selectedGroup ? "bg-white/20 text-white" : "bg-blue-500 text-white"
                        )}
                        aria-label="Unread messages"
                      >
                        {unreadByConversationId[globalGroupId] > 99
                          ? "99+"
                          : unreadByConversationId[globalGroupId]}
                      </span>
                    )}
                  </div>
                  {notificationsPreviewEnabled && globalGroupId && lastMessageByConversationId[globalGroupId] && (
                    <p
                      className={cn(
                        "text-xs mt-1 truncate ml-6",
                        selectedGroup ? "text-white/80" : "text-slate-500"
                      )}
                    >
                      {lastMessageByConversationId[globalGroupId].type === "text"
                        ? lastMessageByConversationId[globalGroupId].content || ""
                        : lastMessageByConversationId[globalGroupId].type === "image"
                          ? "Image"
                          : "File"}
                    </p>
                  )}
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-base mb-3 text-slate-900">Users</h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                  <Input
                    type="text"
                    placeholder="   Search user..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 text-sm w-full bg-white/25 hover:bg-white/40 transition-all duration-200"
                    style={{
                      paddingLeft: '3rem',
                      backdropFilter: 'blur(8px) saturate(140%)',
                      WebkitBackdropFilter: 'blur(8px) saturate(140%)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    }}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-sm text-slate-500 text-center">
                    {searchQuery.trim() ? (
                      <>
                        <Search className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p>No user found</p>
                        <p className="text-xs mt-1">Try searching with another term</p>
                      </>
                    ) : (
                      'No user found'
                    )}
                  </div>
                ) : (
                  <div className="p-2">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUser?.userId === user.userId;
                      const unreadCount = unreadByUserId[user.userId] ?? 0;
                      const lastMessage = lastMessageByUserId[user.userId];

                      return (
                        <button
                          key={user.userId}
                          onClick={() => {
                            openConversation(user);
                          }}
                          className={cn(
                            "w-full text-left p-3 rounded-lg mb-1 transition-all duration-200",
                            isSelected
                              ? "bg-blue-500/90 text-white"
                              : "hover:bg-white/40 bg-white/25"
                          )}
                          style={!isSelected ? {
                            backdropFilter: 'blur(8px) saturate(140%)',
                            WebkitBackdropFilter: 'blur(8px) saturate(140%)',
                          } : undefined}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="min-w-0 flex items-center gap-2 flex-1">
                              <User className="w-4 h-4 shrink-0" />
                              <span className="font-medium text-sm truncate">{user.fullName}</span>
                            </div>
                            {unreadCount > 0 && (
                              <span
                                className={cn(
                                  "ml-2 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center shrink-0",
                                  isSelected ? "bg-white/20 text-white" : "bg-blue-500 text-white"
                                )}
                                aria-label="Unread messages"
                              >
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </span>
                            )}
                          </div>
                          {notificationsPreviewEnabled && lastMessage && (
                            <p
                              className={cn(
                                "text-xs mt-1 truncate ml-6",
                                isSelected ? "text-white/80" : "text-slate-500"
                              )}
                            >
                              {lastMessage.type === "text"
                                ? lastMessage.content || ""
                                : lastMessage.type === "image"
                                  ? "Image"
                                  : "File"}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ãrea de Mensagens - Sempre visível no desktop, condicional no mobile */}
          <div className={cn(
            "flex-1 flex flex-col",
            isMobileSafe && mobileChatStyles.chatCard,
            isMobileSafe && mobileView !== 'chat' && "hidden"
          )}
            style={{
              background: isMobileSafe
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.18) 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.30) 0%, rgba(255, 255, 255, 0.22) 100%)',
              backdropFilter: isMobileSafe ? 'blur(16px) saturate(170%)' : 'blur(10px) saturate(150%)',
              WebkitBackdropFilter: isMobileSafe ? 'blur(16px) saturate(170%)' : 'blur(10px) saturate(150%)',
            }}
          >
            {(selectedUser || selectedGroup) ? (
              <>
                {/* Header do Vendor */}
                <div
                  className={cn(
                    "p-4 border-b",
                    isMobileSafe && "px-4 pt-4 pb-3"
                  )}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                    backdropFilter: 'blur(12px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {isMobileSafe && (
                        <button
                          type="button"
                          onClick={() => setMobileView('vendors')}
                          className="h-9 w-9 rounded-full ring-1 ring-white/40 grid place-items-center text-slate-700 shrink-0 transition-all duration-200 hover:scale-105"
                          style={{
                            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.40) 100%)',
                            backdropFilter: 'blur(10px) saturate(150%)',
                            WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.55) 100%)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.40) 100%)';
                          }}
                          aria-label="Back to user list"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                      )}
                      {selectedGroup ? (
                        <MessageSquare className="w-5 h-5 text-blue-600 shrink-0" />
                      ) : (
                        <User className="w-5 h-5 text-blue-600 shrink-0" />
                      )}
                      <h3 className="font-semibold text-base text-slate-900 truncate">
                        {isMobileSafe
                          ? "BA Express"
                          : selectedGroup
                            ? selectedGroup.groupName || "News"
                            : selectedUser?.fullName || ""}
                      </h3>
                    </div>

                    {isMobileSafe && (
                      <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="h-9 w-9 rounded-full ring-1 ring-white/40 grid place-items-center text-slate-700 transition-all duration-200 hover:scale-105"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.40) 100%)',
                          backdropFilter: 'blur(10px) saturate(150%)',
                          WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.55) 100%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.40) 100%)';
                        }}
                        aria-label="Close chat"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Mensagens */}
                <div
                  className={
                    isMobileSafe
                      ? [mobileChatStyles.messagesArea, mobileChatStyles.messagesAreaWebkit].join(" ")
                      : "flex-1 p-4 overflow-y-auto"
                  }
                >
                  {(() => {
                    const messagesToRender = currentConversationMessages;

                    if (messagesToRender.length === 0) {
                      return (
                        <div className="flex items-center justify-center h-full text-slate-500">
                          <div className="text-center">
                            <MessageSquare className="w-16 h-16 mx-auto mb-3 text-blue-200" />
                            <p className="text-lg font-medium mb-1">No messages yet</p>
                            <p className="text-sm text-slate-400">Send a message to start</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className={isMobileSafe ? "space-y-4" : "space-y-4"}>
                        {messagesToRender.map((message, idx) => {
                          const isFromMe = currentUserId !== null && message.senderId === currentUserId;
                          const isImage = message.type === 'image';
                          const isFile = message.type === 'file';

                          const currentDate = new Date(message.createdAt);
                          const currentKey = dayKey(currentDate);
                          const prev = messagesToRender[idx - 1];
                          const prevKey = prev ? dayKey(new Date(prev.createdAt)) : null;
                          const isFirstOfDay = prevKey !== currentKey;

                          return (
                            <React.Fragment key={message.id}>
                              {isMobileSafe && isFirstOfDay && (
                                <div className={mobileChatStyles.dayMarkerRow}>
                                  <div className={mobileChatStyles.dayMarkerPill}>
                                    {dayLabel(currentDate)}
                                  </div>
                                </div>
                              )}

                              <div
                                className={cn(
                                  "flex",
                                  isFromMe ? "justify-end" : "justify-start"
                                )}
                              >
                                <div
                                  className={
                                    isMobileSafe
                                      ? [
                                        mobileChatStyles.bubbleBase,
                                        isFromMe
                                          ? mobileChatStyles.bubbleRight
                                          : mobileChatStyles.bubbleLeft,
                                      ].join(" ")
                                      : cn(
                                        "max-w-[70%] rounded-lg p-3",
                                        isFromMe
                                          ? "bg-blue-500 text-white"
                                          : "bg-slate-100 text-slate-900"
                                      )
                                  }
                                >
                                  {isImage && message.fileUrl ? (
                                    <div className="space-y-2">
                                      <Image
                                        src={message.fileUrl}
                                        alt={message.content || 'Image'}
                                        width={400}
                                        height={256}
                                        className="max-w-full h-auto rounded-lg max-h-64 object-contain cursor-pointer"
                                        onClick={() => {
                                          if (message.fileUrl) {
                                            window.open(message.fileUrl, '_blank');
                                          }
                                        }}
                                      />
                                      {message.content && (
                                        <p className="text-sm">{message.content}</p>
                                      )}
                                    </div>
                                  ) : isFile && message.fileUrl ? (
                                    <div className="space-y-2">
                                      <a
                                        href={message.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(
                                          "flex items-center gap-2 p-2 rounded-lg transition-colors",
                                          isMobileSafe
                                            ? (isFromMe
                                              ? "bg-white/15 hover:bg-white/20 text-white"
                                              : "bg-slate-200/70 hover:bg-slate-200 text-slate-900")
                                            : (isFromMe
                                              ? "bg-blue-400 hover:bg-blue-300 text-white"
                                              : "bg-slate-200 hover:bg-slate-300 text-slate-900")
                                        )}
                                      >
                                        <FileText className="w-5 h-5 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium truncate">
                                            {message.content || 'File'}
                                          </p>
                                          <p className={cn(
                                            "text-xs",
                                            isMobileSafe
                                              ? (isFromMe ? "text-white/80" : "text-slate-600")
                                              : (isFromMe ? "text-blue-100" : "text-slate-600")
                                          )}>
                                            Click to download
                                          </p>
                                        </div>
                                        <Download className="w-4 h-4 shrink-0" />
                                      </a>
                                      {message.content && (
                                        <p className="text-sm">{message.content}</p>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm">{message.content}</p>
                                  )}
                                  <p className={cn(
                                    "flex items-center gap-1",
                                    isMobileSafe ? "text-[11px] mt-1" : "text-xs mt-1",
                                    isMobileSafe
                                      ? (isFromMe ? "text-white/80" : "text-slate-500")
                                      : (isFromMe ? "text-blue-100" : "text-slate-500")
                                  )}>
                                    {!isFromMe && message.read === false && (
                                      <span
                                        className={cn(
                                          "inline-block w-2 h-2 rounded-full",
                                          isMobileSafe ? "bg-blue-300" : "bg-blue-500"
                                        )}
                                        aria-label="Unread message"
                                      />
                                    )}
                                    {isFromMe && (
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          setViewersModalOpen(true);
                                          setLoadingViewers(true);
                                          try {
                                            const viewers = await fetchMessageViewers(
                                              conversationId!,
                                              message.createdAt
                                            );
                                            setMessageViewers(viewers);
                                          } catch (err) {
                                            console.error('Error fetching viewers:', err);
                                            setMessageViewers([]);
                                          } finally {
                                            setLoadingViewers(false);
                                          }
                                        }}
                                        className={cn(
                                          "inline-flex items-center justify-center rounded-full transition-opacity hover:opacity-70",
                                          isMobileSafe ? "w-4 h-4" : "w-4 h-4",
                                          isMobileSafe
                                            ? "text-white/80 hover:text-white"
                                            : "text-blue-100 hover:text-white"
                                        )}
                                        aria-label="Ver quem visualizou"
                                        title="Ver quem visualizou"
                                      >
                                        <AlertCircle className="w-3 h-3" />
                                      </button>
                                    )}
                                    {new Date(message.createdAt).toLocaleString('en-US', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                    {isFromMe && (
                                      <span className="ml-1 inline-flex items-center">
                                        {message.readByOthers ? (
                                          <CheckCheck className="w-4 h-4" aria-label="Seen" />
                                        ) : (
                                          <Check className="w-4 h-4" aria-label="Sent" />
                                        )}
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </React.Fragment>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    );
                  })()}
                </div>

                {/* Input de Mensagem */}
                <div
                  className={isMobileSafe ? mobileChatStyles.inputBar : "p-4 border-t"}
                  style={!isMobileSafe ? {
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.25) 100%)',
                    backdropFilter: 'blur(12px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                  } : undefined}
                >
                  {/* Preview de arquivo selecionado */}
                  {selectedFile && (
                    <div className={cn(
                      "mb-3 p-3 flex items-start gap-3 rounded-2xl ring-1",
                      isMobileSafe
                        ? "ring-white/40"
                        : "ring-white/30 rounded-lg"
                    )}
                      style={{
                        background: isMobileSafe
                          ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.50) 0%, rgba(255, 255, 255, 0.40) 100%)'
                          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.60) 0%, rgba(241, 245, 249, 0.50) 100%)',
                        backdropFilter: 'blur(10px) saturate(150%)',
                        WebkitBackdropFilter: 'blur(10px) saturate(150%)',
                        borderColor: isMobileSafe ? 'rgba(255, 255, 255, 0.35)' : 'rgba(226, 232, 240, 0.4)',
                      }}
                    >
                      {filePreview ? (
                        <Image
                          src={filePreview}
                          alt="Preview"
                          width={64}
                          height={64}
                          className={isMobileSafe ? "w-14 h-14 object-cover rounded-xl" : "w-16 h-16 object-cover rounded-lg"}
                        />
                      ) : (
                        <div className={cn(
                          "bg-slate-200 flex items-center justify-center",
                          isMobileSafe ? "w-14 h-14 rounded-xl" : "w-16 h-16 rounded-lg"
                        )}>
                          <FileText className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <button
                        onClick={removeSelectedFile}
                        className="p-1 hover:bg-slate-200 rounded transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  )}

                  {isMobileSafe ? (
                    <div className={mobileChatStyles.inputRow}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-input"
                        disabled={isSending}
                      />

                      <button
                        type="button"
                        className={mobileChatStyles.attachBtn}
                        aria-label="Anexar"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending || isVendorInNewsGroup}
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>

                      <input
                        className={mobileChatStyles.textInput}
                        placeholder={isVendorInNewsGroup ? "Read-only: Vendors cannot send messages in News" : "Type your message..."}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !isVendorInNewsGroup) {
                            e.preventDefault();
                            sendTextMessage();
                          }
                        }}
                        disabled={isSending || isVendorInNewsGroup}
                      />

                      <button
                        type="button"
                        className={mobileChatStyles.sendBtn}
                        aria-label="Send"
                        onClick={sendTextMessage}
                        disabled={(!inputMessage.trim() && !selectedFile) || isSending || isVendorInNewsGroup}
                      >
                        {isSending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="file-input"
                        disabled={isSending}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSending || isVendorInNewsGroup}
                        className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Attach file"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && !isVendorInNewsGroup) {
                            e.preventDefault();
                            sendTextMessage();
                          }
                        }}
                        placeholder={isVendorInNewsGroup ? "Read-only: Vendors cannot send messages in News" : "Type your message..."}
                        disabled={isSending || isVendorInNewsGroup}
                        className="flex-1 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 h-10"
                      />
                      <button
                        type="button"
                        onClick={sendTextMessage}
                        disabled={(!inputMessage.trim() && !selectedFile) || isSending || isVendorInNewsGroup}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Send message"
                      >
                        {isSending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p>Select a user or group to start</p>
                  {isMobileSafe && (
                    <button
                      type="button"
                      onClick={() => setMobileView('vendors')}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-700"
                    >
                      Ver usuários
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal de Visualizações */}
        <Dialog open={viewersModalOpen} onOpenChange={setViewersModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Quem visualizou esta mensagem</DialogTitle>
              <DialogDescription>
                Lista de usuários que visualizaram esta mensagem
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              {loadingViewers ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : messageViewers.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  <p>Ninguém visualizou esta mensagem ainda</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messageViewers.map((viewer: MessageViewer) => (
                    <div
                      key={viewer.userId}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-slate-400" />
                        <span className="font-medium text-slate-900">{viewer.fullName}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {new Date(viewer.seenAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};


