import { BNCC } from "../enitties/bncc";
import { KnowledgeArea } from "../enitties/questionFTD";

interface BnccPoliedroKnowledgeArea {
  referenceId: number;
  name: string;
}

interface BnccPoliedroCurricularComponent {
  name: string;
  referenceId: number;
}

interface BnccPoliedroSegments {
  referenceId: number;
  name: string;
}

interface BNCCPoliedro {
  codeLearningSkill: string;
  learningSkill: string;
  knowledgeArea: BnccPoliedroKnowledgeArea,
  curricularComponent: BnccPoliedroCurricularComponent,
  segments: BnccPoliedroSegments[],
  specificCompetence: string;
}

interface bnccContent {
  number: string;
  description: string;
}

interface bnccTree {
  knowledgeArea: number;
  content: bnccContent[]
}

export class BnccPoliedroFTDSchemaMapper {
  knowledgeAreaMapper(knowledgeArea: string) {
    switch (knowledgeArea) {
      case 'Linguagens': return 'Linguagens, Códigos e suas Tecnologias'
      case 'Ciências Humanas': return 'Ciências Humanas e suas Tecnologias'
      case 'Ciências da Natureza': return 'Ciências da Natureza e suas Tecnologias'
      case 'Matemática': return 'Matemática e suas Tecnologias'
      default: return 'Adicionar área do conhecimento'
    }
  }

  excecute(input: BNCCPoliedro[], bnccTree: bnccTree[]) {


    const output = input.map((bncc: BNCCPoliedro) => {

      if (/^EF/.test(bncc.codeLearningSkill)) {

        const findSpecificCompetence = bnccTree.find((tree: bnccTree) => tree.knowledgeArea === bncc.knowledgeArea.referenceId)?.content.find((content: bnccContent) => content.number === bncc.specificCompetence)

        const obj = {
          knowledgeArea: bncc.knowledgeArea.referenceId,
          subject: bncc?.curricularComponent ? bncc?.curricularComponent.referenceId : null,
          specificCompetence: [findSpecificCompetence],
          skill: {
            code: bncc.codeLearningSkill,
            description: bncc.learningSkill
          }
        }
        return obj
      }
    })

    return output;
  }
}