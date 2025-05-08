export enum Format {
  SINGLE_ANSWER = 'Resposta única (Mútipla escolha)',
  ESSAY = 'Dissertativa',
  ALTERNATIVE = 'Alternativa',
  MULTIPLE_ANSWER = 'Resposta múltipla',
  TRUE_OR_FALSE = 'Verdadeiro ou Falso',
  ESSAY_SHEET = 'Folha de redação',
  HTML = 'Campo HTML',
  GAP = 'Lacuna',
  SUM = 'Somatório',
}

export enum Subject {
  PORTUGUESE = 'Língua Portuguesa',
  MATH = 'Matemática',
  HISTORY = 'História',
  GEOGRAPHY = 'Geografia',
  BIOLOGY = 'Biologia',
  PHYSICAL_EDUCATION = 'Educação Física',
  ART = 'Arte',
  PHILOSOPHY = 'Filosofia',
  SOCIOLOGY = 'Sociologia',
  PHYSICS = 'Física',
  SCIENCE = 'Ciências',
  RELIGIOUS_EDUCATION = 'Ensino Religioso',
  ENGLISH = 'Língua Inglesa',
  CHEMISTRY = 'Química',
  SPANISH = 'Língua Espanhola',
  WRITING = 'Produção De Texto',
}

export enum KnowledgeArea {
  LANGUAGES = 'Linguagens, Códigos e suas Tecnologias',
  HUMAN_SCIENCES = 'Ciências Humanas e suas Tecnologias',
  NATURAL_SCIENCES = 'Ciências da Natureza e suas Tecnologias',
  MATH = 'Matemática e suas Tecnologias',
}

export enum Stage {
  EARLYCHILDHOOD = 'EI',
  ELEMENTARY_EARLY = 'EFAI',
  ELEMENTARY_LATE = 'EFAF',
  HIGH_SCHOOL = 'EM',
  PRE_UNIVERSITY = 'PV',
}

export enum Complexity {
  VERY_EASY = 'Muito Fácil',
  EASY = 'Fácil',
  INTERMEDIATE = 'Intermediário',
  HARD = 'Difícil',
  VERY_HARD = 'Muito Difícil',
}

export enum Status {
  SAVED = 0,
  AWAITING_VALIDATION = 1,
  PUBLISHED = 2,
  ANNULLED = 3,
}

export enum Year {
  EARLY_CHILDHOOD = 'Ensino Infantil',
  FIRST_GRADE = '1º ano',
  SECOND_GRADE = '2º ano',
  THIRD_GRADE = '3º ano',
  FOURTH_GRADE = '4º ano',
  FIFTH_GRADE = '5º ano',
  SIXTH_GRADE = '6º ano',
  SEVENTH_GRADE = '7º ano',
  EIGHTH_GRADE = '8º ano',
  NINTH_GRADE = '9º ano',
  FIRST_YEAR_HIGH_SCHOOL = '1ª série',
  SECOND_YEAR_HIGH_SCHOOL = '2ª série',
  THIRD_YEAR_HIGH_SCHOOL = '3ª série',
}

enum OriginType {
  EXTERNAL = 'Externo',
  FTD = 'FTD',
}

export interface BookRef {
  edition?: string;
  collection?: string;
  series?: string;
  chapterNumber?: string;
  section?: string;
}

export interface SolutionDetails {
  solutionId?: string;
  questionType?: string;
  referenceBook?: BookRef[];
  FtdAssessments?: FtdAssessments;
}

interface FtdAssessments {
  educationSystem?: string;
  batches?: string[];
  questionJustification?: string;
  parameterA?: string;
  parameterB?: string;
  parameterC?: string;
  bisserial?: string;
  probabilityRanges?: string[];
}

export interface Origin {
  type?: OriginType;
  external?: ExternalSource[];
}

interface ExternalSource {
  source: string;
  sublevels: SubLevels[];
}

interface SubLevels {
  code: string;
  level: number;
}

export interface Classification {
  traditional?: Traditional[];
  enem?: Enem[];
  bncc?: BNCC[];
  formativeTracks?: FormativeTracks;
}

interface Traditional {
  id: string;
  subject: string;
  levels: Level[];
}

interface Level {
  id: string;
  code: string;
  level: number;
}

interface Enem {
  id: string;
  code: string;
  competence: Competence;
  skill: Skill;
  knowledgeArea: string;
  segments: string[];
}

interface Competence {
  code: string;
  description: string;
}

interface Skill {
  code: string;
  description: string;
}

interface BNCC {
  id: string;
  skillCode: string;
  skill: string;
  knowledgeArea: string;
  segments: string[];
}

interface FormativeTracks {
  id: string;
  tracks: string[];
}

export interface Content {
  introductoryText?: IntroductoryText;
  supportText?: SupportText;
  fields?: Field[];
  solution?: Solution;
}

interface IntroductoryText {
  body?: string;
  hasVisualElement: boolean;
}

interface SupportText {
  body?: string;
  hasVisualElement: boolean;
}

interface Field {
  statement?: Statement;
  format: Format;
  alternatives?: Alternative[];
}

interface Statement {
  body?: string;
  text?: string;
  hasVisualElement: boolean;
}

interface Alternative {
  order?: number;
  label?: string;
  body?: string;
  correct?: boolean;
  nominalValue?: number;
  realValue?: number;
  justification?: string;
  charLimit?: number;
  isNumericAnswer?: boolean;
  hasVisualElement: boolean;
}

interface Solution {
  body?: string;
  hasVisualElement: boolean;
  answer?: string;
}

export interface RelatedProject {
  id: number;
  label: string;
}

export interface QuestionFTD {
  id: string;
  aggregatedId?: number;
  knowledgeArea?: KnowledgeArea;
  subject?: Subject;
  stage?: Stage;
  classification?: Classification;
  complexity?: Complexity;
  content?: Content;
  relatedProject?: RelatedProject;
  status: Status;
  origin?: Origin;
  year?: Year[];
  history?: string[];
  questionUsed: boolean;
  anchorQuestion: boolean;
  questionCycle?: number;
  transversalTheme?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}
