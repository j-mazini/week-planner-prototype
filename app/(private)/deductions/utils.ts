import { DeductionItem } from './types';

/**
 * Formata data para exibição (dd/mm/aa).
 *
 * Usa componentes em UTC para evitar deslocamento de fuso (off-by-one): as datas
 * de dedução representam apenas o dia do calendário e são ancoradas ao meio-dia
 * UTC, então formatar em UTC mantém o mesmo dia em qualquer fuso.
 */
export const formatDate = (dateString: string): string => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = String(d.getUTCFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

/**
 * Retorna "YYYY-MM" a partir de uma data.
 *
 * Usa componentes em UTC pelo mesmo motivo de `formatDate`: as datas de dedução são
 * ancoradas em UTC e representam apenas o dia do calendário. Com componentes locais,
 * uma parcela do dia 1 caía no mês anterior em fusos negativos — saía de
 * `currentMonthItems`, recebia `currentInstallment: 0` e era descartada do total
 * por `calculateTotalDeductions`, reintroduzindo o bug de soma da BAE-437.
 */
const toMonthYear = (dateString: string): string => {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

/**
 * Processa e agrupa deduções.
 *
 * Regras:
 * - O agrupamento é feito pela identidade REAL da dedução (deductionType + deductionId),
 *   pois todas as parcelas (installments) de uma mesma dedução compartilham esse par.
 *   O heurístico anterior (cortar o último "-" do referenceNumber) mesclava deduções
 *   distintas que compartilhavam prefixo, escondendo itens (ex.: item de 240 do Fernando).
 * - O valor exibido/somado do mês é a SOMA de todas as parcelas que caem no mês
 *   selecionado (corrige múltiplos itens no mesmo dia/mês não sendo somados).
 * - Cada dedução real vira um único item -> uma única progress bar por dedução.
 */
export const processDeductions = (data: DeductionItem[], year: string, month: string): DeductionItem[] => {
  const selectedMonthYear = `${year}-${month}`;
  // Fim do último dia do mês selecionado, em UTC (month é 1-based: "06" => Junho).
  // Dia 0 do mês seguinte = último dia do mês atual. O horário 23:59:59.999 evita que
  // uma parcela do próprio último dia — ancorada em meia-noite UTC — fique de fora da
  // comparação `<=` por diferença de horas.
  const endOfSelectedMonth = new Date(Date.UTC(Number(year), Number(month), 0, 23, 59, 59, 999));

  // Agrupa pela identidade real da dedução.
  const groupedDeductions = data.reduce(
    (acc: { [key: string]: DeductionItem[] }, curr: DeductionItem) => {
      const key = `${curr.deductionType}-${curr.deductionId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(curr);
      return acc;
    },
    {}
  );

  const processedDeductions = Object.entries(groupedDeductions).map(
    ([key, items]) => {
      const sortedItems = [...(items as DeductionItem[])].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Parcelas que caem no mês/ano selecionado.
      const currentMonthItems = sortedItems.filter(
        (item) => toMonthYear(item.date) === selectedMonthYear
      );

      // Item representativo (primeiro do mês atual, senão o mais antigo).
      const displayItem = currentMonthItems[0] || sortedItems[0];

      // Soma de TODAS as parcelas do mês selecionado (corrige múltiplos itens no mesmo dia).
      const currentMonthAmount = currentMonthItems.reduce(
        (sum, item) => sum + parseFloat(item.amount),
        0
      );

      // Soma total do plano (todas as parcelas).
      const totalAmount = sortedItems
        .reduce((sum, item) => sum + parseFloat(item.amount), 0)
        .toFixed(2);

      const totalInstallments = sortedItems.length;

      // Passo atual = nº de parcelas com data até o fim do mês selecionado.
      const currentInstallmentStep = sortedItems.filter(
        (item) => new Date(item.date) <= endOfSelectedMonth
      ).length;

      const hasCurrentMonth = currentMonthItems.length > 0;

      return {
        ...displayItem,
        // Valor do mês = soma das parcelas do mês; fallback para o item exibido.
        amount: hasCurrentMonth
          ? currentMonthAmount.toFixed(2)
          : displayItem.amount,
        description: displayItem.description,
        uniqueId: key,
        totalInstallments,
        // 0 quando não há parcela no mês (evita contar no total do mês).
        currentInstallment: hasCurrentMonth ? currentInstallmentStep : 0,
        totalAmount,
      };
    }
  );

  return processedDeductions;
};

/**
 * Calcula o total de deduções
 */
export const calculateTotalDeductions = (deductions: DeductionItem[]): number => {
  return deductions.reduce((sum, item) => {
    if (item.currentInstallment === 0) {
      return sum;
    }
    return sum + parseFloat(item.amount);
  }, 0);
};

/**
 * Gera itens do carrossel de meses
 */
export const generateMonthItems = (): { label: string; year: number; month: number; key: string; date: Date }[] => {
  const today = new Date();
  const items: { label: string; year: number; month: number; key: string; date: Date }[] = [];
  const startOffset = -6; // 6 meses para trás
  const endOffset = 6;     // 6 meses para frente
  for (let i = startOffset; i <= endOffset; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthName = d.toLocaleString("en-US", { month: "short" }).replace('.', '');
    const newFormat = `${monthName}/${d.getFullYear()}`;
    items.push({
      label: newFormat,
      year: d.getFullYear(),
      month: d.getMonth(),
      key: `${d.getFullYear()}-${d.getMonth()}`,
      date: d,
    });
  }
  return items;
};


