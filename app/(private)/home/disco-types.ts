/** Uma entrega (linha do Excel DISCO). */
export interface DiscoDeliveryRow {
  depot: string;
  route: string;
  loop: string;
  subpostcode: string;
  address: string;
  recipient: string;
  pre12: boolean;
  asr: boolean;
  dsr: boolean;
}

/** Info por rota (byRoute). */
export interface DiscoByRouteItem {
  sortWave: string;
  loop: string | null;
  depot: string | null;
  subpostcodes: string[];
}

/** Loop com totais e rotas. */
export interface DiscoLoopInfo {
  totalDeliveries: number;
  routes: { route: string; deliveries: number }[];
}

/** Dados parseados do Excel para o dashboard (formato disco.json). */
export interface DashboardDisco {
  source: string;
  depot: string;
  loop: string;
  routes: string[];
  /** Rotas do turno AM */
  am?: string[];
  /** Rotas do turno PM */
  pm?: string[];
  deliveries: DiscoDeliveryRow[];
  loops: Record<string, DiscoLoopInfo>;
  byRoute?: Record<string, { subpostcodes: string[] }>;
}

/** Resultado do parse da sheet (antes de converter para dashboard). */
export interface ParsedDiscoData {
  am: string[];
  pm: string[];
  byRoute: Record<string, DiscoByRouteItem>;
  rawDeliveries: DiscoDeliveryRow[];
}
