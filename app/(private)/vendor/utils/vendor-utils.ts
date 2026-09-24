import type { Vendor } from '@/lib/vendors-api';

/**
 * Formata data para yyyy-mm-dd (apenas a parte da data, sem hora)
 */
export const formatDateOnly = (dateString: string | undefined): string => {
  if (!dateString) return '';
  try {
    // Se já está no formato yyyy-mm-dd, retorna direto
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Se tem hora, pega apenas a parte da data usando UTC para evitar problemas de timezone
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    // Se a string contém 'Z' ou tem formato ISO com timezone, usar métodos UTC
    // Caso contrário, usar métodos locais
    const useUTC = dateString.includes('Z') || dateString.includes('+') || dateString.includes('T');
    const year = useUTC ? date.getUTCFullYear() : date.getFullYear();
    const month = String((useUTC ? date.getUTCMonth() : date.getMonth()) + 1).padStart(2, '0');
    const day = String(useUTC ? date.getUTCDate() : date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateString;
  }
};

/**
 * Formata data para exibição no formato dd/mm/yyyy
 */
export const formatDateForDisplay = (dateString: string | undefined): string => {
  if (!dateString) return '';
  try {
    // Se já está no formato yyyy-mm-dd, converter para dd/mm/yyyy
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    // Se tem hora, pega apenas a parte da data e formata
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
};

/**
 * Aplica máscara de telefone flexível que aceita qualquer número internacional
 */
export const formatPhone = (value: string): string => {
  if (!value) return '';

  // Remove tudo que não é número ou +
  const cleaned = value.replace(/[^\d+]/g, '');

  // Se estiver vazio, retornar vazio
  if (!cleaned) return '';

  // Se começar com +, manter o + e formatar os números
  if (cleaned.startsWith('+')) {
    const numbers = cleaned.slice(1).replace(/\D/g, '');
    if (!numbers) return '+';

    // Formatar com espaços a cada 3-4 dígitos para melhor legibilidade
    // Mas não forçar formato específico
    if (numbers.length <= 3) {
      return `+${numbers}`;
    } else if (numbers.length <= 6) {
      return `+${numbers.slice(0, 3)} ${numbers.slice(3)}`;
    } else if (numbers.length <= 10) {
      return `+${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
    } else {
      // Para números maiores, agrupar de forma mais flexível
      let formatted = `+${numbers.slice(0, 3)}`;
      let remaining = numbers.slice(3);
      while (remaining.length > 0) {
        const chunkSize = remaining.length > 4 ? 4 : remaining.length;
        formatted += ` ${remaining.slice(0, chunkSize)}`;
        remaining = remaining.slice(chunkSize);
      }
      return formatted;
    }
  }

  // Se não começar com +, apenas formatar os números
  const numbers = cleaned.replace(/\D/g, '');
  if (!numbers) return '';

  // Formatar com espaços para melhor legibilidade
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
  } else if (numbers.length <= 10) {
    return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
  } else {
    // Para números maiores, agrupar de forma flexível
    let formatted = numbers.slice(0, 3);
    let remaining = numbers.slice(3);
    while (remaining.length > 0) {
      const chunkSize = remaining.length > 4 ? 4 : remaining.length;
      formatted += ` ${remaining.slice(0, chunkSize)}`;
      remaining = remaining.slice(chunkSize);
    }
    return formatted;
  }
};

/**
 * Gera o Vendor ID baseado nas iniciais do nome e sobrenome
 * Exemplo: Gabriel Martin -> GM-01
 * Usa o último ID de usuário do backend como base para o autoincremento
 */
export const generateVendorId = (firstName: string, lastName: string, existingVendors: Vendor[]): string => {
  if (!firstName || !lastName) return '';

  // Pegar primeira letra de cada nome (maiúscula)
  const firstInitial = firstName.trim().charAt(0).toUpperCase();
  const lastInitial = lastName.trim().charAt(0).toUpperCase();
  const initials = `${firstInitial}${lastInitial}`;

  // Buscar o último ID de usuário do backend (maior ID)
  const maxUserId = existingVendors.length > 0
    ? Math.max(...existingVendors.map(v => v.id || 0))
    : 0;

  // Encontrar todos os vendors que começam com essas iniciais
  const matchingVendors = existingVendors.filter(v => {
    if (!v.supplierId) return false;
    return v.supplierId.startsWith(`${initials}-`);
  });

  // Extrair números existentes e encontrar o próximo
  const numbers = matchingVendors
    .map(v => {
      const match = v.supplierId?.match(/-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter(n => !isNaN(n));

  // Se não houver vendors com essas iniciais, usar o último user_id + 1
  // Caso contrário, usar o maior número das iniciais + 1
  const nextNumber = numbers.length > 0
    ? Math.max(...numbers) + 1
    : maxUserId + 1;

  return `${initials}-${String(nextNumber).padStart(2, '0')}`;
};

export const getExpiringSoonStatus = (sub: Vendor) => {
  const today = new Date();
  const ninetyDaysFromNow = new Date(new Date(today).setDate(today.getDate() + 90));
  const fieldsToCheck = [sub.visaValidity, sub.licenceExpiringDate, sub.passportExpiringDate];

  for (const dateString of fieldsToCheck) {
    if (dateString) {
      const date = new Date(dateString);
      if (date <= ninetyDaysFromNow) return 'Yes';
    }
  }
  return 'None';
};

/**
 * Verifica se uma data está expirada (passou da data de vencimento)
 */
export const isExpired = (expiryDate: string | null | undefined): boolean => {
  if (!expiryDate) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetar horas para comparar apenas datas

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    return expiry < today;
  } catch {
    return false;
  }
};

/**
 * Verifica se uma data está expirando em breve (30 dias antes do vencimento)
 */
export const isExpiringSoon = (expiryDate: string | null | undefined): boolean => {
  if (!expiryDate) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    thirtyDaysFromNow.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    // Está expirando em breve se: hoje <= expiry <= 30 dias a partir de hoje
    // E não está expirado ainda
    return expiry >= today && expiry <= thirtyDaysFromNow;
  } catch {
    return false;
  }
};

/**
 * Calcula a data de expiração de um treinamento baseado na data de conclusão
 * Validade de 2 anos após a conclusão
 */
export const getTrainingExpiryDate = (completedDate: string | null | undefined): string | null => {
  if (!completedDate) return null;
  try {
    const completed = new Date(completedDate);
    const expiry = new Date(completed);
    expiry.setFullYear(completed.getFullYear() + 2);
    return expiry.toISOString().split('T')[0]; // Retorna no formato yyyy-mm-dd
  } catch {
    return null;
  }
};

