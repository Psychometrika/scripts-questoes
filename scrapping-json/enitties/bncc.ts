export enum EBNCCKnowledgeArea {
  'Linguagens e suas Tecnologias' = 1,
  'Matemática e suas Tecnologias' = 2,
  'Ciências da Natureza e suas Tecnologias' = 3,
  'Ciências Humanas e suas Tecnologias' = 4,
}

export type SpecificCompetence = {
  number: number | null;
  description: string | null;
}

export type Skill = {
  code: string;
  description: string;
}


export interface BNCC {
  knowledgeArea: EBNCCKnowledgeArea;
  subject: string;
  specificCompetence: SpecificCompetence[];
  skill: Skill;
}