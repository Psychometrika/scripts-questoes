
interface ILivroRef {
  ed?: string;
  colecao?: string;
  serie?: string;
  numeroCapitulo?: string;
  secao?: string;
  segmento?: string;
}

interface IPMaisAvaliacoes {
  sistemaEnsino?: string;
  lotes?: string[];
  justificativaQuestao?: string;
  parametroA?: string;
  parametroB?: string;
  parametroC?: string;
  bisserial?: string;
  probabilidadeFaixas?: number | null;
}

interface ISolucao {
  solucaoId?: string;
  tipoQuestao?: string;
  livroRef?: ILivroRef[];
  pmaisAvaliacoes?: IPMaisAvaliacoes;
}

interface IExternalSource {
  fonte: string;
  subniveis: { codigo: string; nivel: number }[];
}

interface IOrigem {
  tipo?: 'Interna/Externa' | 'Poliedro | Sistema de Ensino';
  externo?: Map<string, string[]>;
  externos: IExternalSource[];
  simulado?: string;
}

interface INivel {
  id: string;
  codigo: string;
  nivel: number;
}

interface ITradicional {
  id: string;
  disciplina: string;
  niveis: INivel[];
}

interface ICompetencia {
  codigo: string;
  descricao: string;
}

interface IHabilidade {
  codigo: string;
  descricao: string;
}

interface IEnem {
  id: string;
  codigo: string;
  competencia: ICompetencia;
  habilidade: IHabilidade;
  areaDoConhecimento: string;
  segmentos: string[];
}

interface IBNCC {
  id: string;
  codigoHabilidade: string;
  habilidade: string;
  areaDoConhecimento: string;
  segmentos: string[];
}

interface IClassificacao {
  tradicional?: string[];
  enem?: string[];
  bncc?: string[];
  tradicionais?: ITradicional[];
  enems?: IEnem[];
  bnccs?: IBNCC[];
  itinerarioFormativos?: string[];
  itinerarioFormativosId?: string;
}

interface ICicloAvaliativo {
  estudar?: string;
  praticar?: string;
  videoAula?: string;
  linkExterno?: string;
  materialDigital?: string;
  pMaisId?: string;
  nomeLivro?: string;
  anoUso?: string;
  pagina?: string;
  disciplina?: string;
  frente?: string;
  capitulo?: string;
  cicloAvaliativoId?: string;
}

interface ITagsVisuais {
  tipo?: string;
  tags?: string[];
}

interface IEnunciado {
  corpo?: string;
  texto?: string;
}

interface IAlternativa {
  ordem?: number;
  label?: string;
  corpo?: string;
  correta?: boolean;
  valorNominal?: number;
  valorReal?: number;
  justificativa?: string;
  limiteCaracteres?: number | null;
  respostaNumericas?: boolean;
}

interface ICampo {
  enunciado?: IEnunciado;
  textoIntrodutorio?: string;
  formato: string;
  alternativas?: IAlternativa[];
}

interface IResolucao {
  corpo?: string;
  resposta?: string;
  link?: string;
}

interface IConteudo {
  tagsVisuais?: ITagsVisuais;
  isCreateAi?: boolean;
  campos?: ICampo[];
  resolucao?: IResolucao;
}

export enum Status {
  'Inativa' = 4,
  'Validada' = 3,
  'Pendente' = 2,
  'Publicada' = 1,
  'Rascunho' = 0,
}

export interface QuestionPoliedro {
  status: Status;
  solucao?: ISolucao;
  universo?: string;
  isFontePoliedro?: boolean;
  aggregatedId?: number;
  areaConhecimentoId?: number;
  disciplinaId?: number;
  orientacaoEstudo?: string;
  fontesUnicas?: string[];
  etapa?: string;
  ano?: string[];
  origem?: IOrigem;
  classificacao?: IClassificacao;
  cicloAvaliativo?: ICicloAvaliativo;
  complexidade?: string;
  classificacaoQuestao?: string;
  conteudo?: IConteudo;
  temaTransversal?: string;
  posAplicacao?: boolean;
  criadoEm?: Date;
  criadoPor?: string;
  ultimaAtualizacao?: Date;
  questaoUtilizada?: boolean;
}