
export interface Exercise {
  id?: string;
  name: string;
  description?: string;
  benefits?: string;
  thumb?: string | null;
  // Prescription Fields
  sets?: string;
  reps?: string;
  rest?: string;
  load?: string; // User input
}

export interface Workout {
  id: string;
  studentId?: string; // Campo adicionado para vínculo direto com aluno
  title: string;
  exercises: Exercise[];
  // Scheduling Fields
  startDate?: string;
  endDate?: string;
  frequencyWeekly?: number;
  projectedSessions?: number; // Total calculated sessions (e.g., 10)
  
  // Novos campos para compatibilidade com sistema de prescrição direta
  tipo?: string; // 'Corrida', 'Musculação', etc.
  concluido?: boolean;
  diasSemana?: string[];
  estimulo?: string;
  descricao?: string;
  velocidade?: string;
  intensidade?: string;
  tempoTotal?: string;
  observacoes?: string;
}

export interface PeriodizationMicrocycle {
  semana: number;
  foco: string;
  faixa_repeticoes: string;
  pse_alvo: string;
}

export interface PeriodizationPlan {
  id: string;
  titulo: string;
  startDate: string; // ISO String
  volume_por_grupo: string;
  detalhes_treino: string;
  microciclos: PeriodizationMicrocycle[];
  type: 'STRENGTH' | 'RUNNING';
}

export interface PhysicalAssessment {
  id: string;
  data: string; // ISO Date string
  peso: string | number;
  altura: string | number;
  // Skinfolds
  dc_peitoral?: string | number;
  dc_abdominal?: string | number;
  dc_coxa?: string | number;
  dc_tricipital?: string | number;
  dc_suprailiaca?: string | number;
  // Bioimpedance
  bio_percentual_gordura?: string | number;
  bio_massa_magra?: string | number;
  bio_musculo_esqueletico?: string | number;
  bio_massa_ossea?: string | number;
  bio_agua_corporal?: string | number;
  bio_gordura_visceral?: string | number;
  bio_idade_metabolica?: string | number;
  bio_tmb?: string | number;
  // Perimeters
  p_cintura?: string | number;
  p_quadril?: string | number;
  
  aiAnalysis?: string;
  [key: string]: any;
}

export interface WorkoutHistoryEntry {
  id: string;
  workoutId?: string; // Link to specific workout plan
  name: string;
  duration: string;
  date: string;
  timestamp: number;
  
  // Campos Avançados Galaxy Watch / Execução
  tipo?: string;
  hora?: string;
  distancia?: string | number;
  calorias?: string | number;
  ritmoMedio?: string;
  
  // Fisiologia Cardíaca
  fcMedia?: string | number;
  fcMaxima?: string | number; // Added
  
  // Dinâmica de Corrida
  cadenciaMedia?: string | number;
  passos?: string | number;
  
  // Elevação e Hidratação
  ganhoElevacao?: string | number;
  maiorElevacao?: string | number;
  perdaSuor?: string | number;

  // Métricas Avançadas
  metricasAvancadas?: {
    assimetria?: number | string;
    tempoSolo?: number | string;
    vertical?: number | string;
    rigidez?: number | string;
  };

  // Fisiologia
  vo2Max?: string | number;
  classificacaoVO2?: string;
  porcentagemVO2?: string | number;
  
  // Dados Complexos
  zonasFC?: Array<{nome: string, faixa: string, tempo: string, percentual: number}>;
  voltas?: Array<{numero: number, tempo: string, distancia: string, ritmo: string}>;
}

export interface AppNotification {
  id: string;
  type: 'WORKOUT' | 'ASSESSMENT' | 'DIET' | 'GENERAL';
  message: string;
  timestamp: number;
  read: boolean;
}

// Analytics Types
export interface ExerciseStats {
  completed: number;
  skipped: number;
  lastPerformed?: number;
}

export interface AnalyticsData {
  exercises: Record<string, ExerciseStats>; // Key is exercise name
  sessionsCompleted: number;
  streakDays: number;
  lastSessionDate?: string;
}

// Nutrition Types
export interface MacroNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MealLog {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  macros: MacroNutrients;
}

export interface MealPlan {
  id: string;
  generatedDate: string;
  goal: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string;
  targetMacros: MacroNutrients;
}

export interface NutritionProfile {
  goal: string; // e.g., "Muscle Gain", "Weight Loss"
  restrictions: string; // e.g., "Vegan", "Lactose Intolerant"
  dailyTargets: MacroNutrients;
  mealPlans?: MealPlan[];
  logs?: MealLog[];
}

export interface Student {
  id: string;
  nome: string;
  email: string;
  photoUrl?: string;
  sexo?: 'Masculino' | 'Feminino';
  workouts?: Workout[];
  workoutHistory?: WorkoutHistoryEntry[];
  physicalAssessments?: PhysicalAssessment[];
  weightHistory?: any[];
  // New Fields
  notifications?: AppNotification[];
  analytics?: AnalyticsData;
  nutrition?: NutritionProfile;
  runningWorkouts?: any[];
  periodization?: PeriodizationPlan; // Strength Periodization
  runningPeriodization?: PeriodizationPlan; // Running Periodization
  
  lastUpdateTimestamp?: number;

  // RunTrack / Anamnese Fields
  age?: string | number;
  weight?: string | number;
  height?: string | number;
  goal?: string;
  environment?: string;
  timeOfDay?: string;
  usesWatch?: string;
  limitations?: string;
  medications?: string;
  injuryHistory?: string;
  activeNow?: string;
  strengthTraining?: string;
  daysPerWeek?: string | number;
  otherSports?: string;
  anamneseComplete?: boolean;
}

export interface WeatherData {
  temp: number;
  feels: number;
  rain: string;
}

declare global {
  interface Window {
    __firebase_config: any;
    __app_id: string;
    __initial_auth_token?: string;
  }
}
