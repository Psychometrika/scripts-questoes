import { KnowledgeArea } from "../enitties/questionFTD";
import { QuestionPoliedro } from "../enitties/questionPoliedro";


export class PoliedroToFtdSchemaMapper {
  knowledgeAreaMapper(knowledgeArea: string) {
    switch (knowledgeArea) {
      case 'Linguagens': return 'Linguagens, Códigos e suas Tecnologias'
      case 'Ciências Humanas': return 'Ciências Humanas e suas Tecnologias'
      case 'Ciências da Natureza': return 'Ciências da Natureza e suas Tecnologias'
      case 'Matemática': return 'Matemática e suas Tecnologias'
      default: return 'Adicionar área do conhecimento'
    }
  }

  originMapper(origin: string | undefined) {
    switch (origin) {
      case 'Poliedro | Sistema de Ensino': return 'FTD'
      default: return 'Externo'
    }
  }

  formatMapper(format: string | undefined) {
    switch (format) {
      case 'Simples Escolha': return 'Resposta única (Mútipla escolha)'
      case 'Dissertativa': return 'Dissertativa'
      default: return 'Formato não reconhecido'
    }
  }

  excecute(input: QuestionPoliedro[]) {
    const formats = input.map((question: QuestionPoliedro) => question.conteudo?.campos?.map((campo) => campo.formato)).flat()

    console.log('formats', new Set(formats));


    const output = input.map((question: QuestionPoliedro) => ({
      aggregatedId: question.aggregatedId,
      knowledgeArea: question.classificacao?.enems?.length && this.knowledgeAreaMapper(question.classificacao?.enems[0].areaDoConhecimento),
      subject: question.classificacao?.tradicionais?.length ? question.classificacao?.tradicionais[0].disciplina : 'adicionar disciplina',
      stage: question.etapa,
      classification: {
        traditional: question.classificacao?.tradicionais?.map((tradicional) => ({
          subject: tradicional.disciplina,
          levels: tradicional.niveis.map((nivel) => ({
            code: nivel.codigo,
            level: nivel.nivel,
          }))
        })),
        enem: question.classificacao?.enems?.map((enem) => ({
          code: enem.codigo,
          competence: {
            code: enem.competencia.codigo,
            description: enem.competencia.descricao,
          },
          skill: {
            code: enem.habilidade.codigo,
            description: enem.habilidade.descricao,
          },
          knowledgeArea: enem.areaDoConhecimento,
          segments: enem.segmentos
        })),
        bncc: question.classificacao?.bnccs?.map((bncc) => ({
          skillCode: bncc.codigoHabilidade,
          skill: bncc.habilidade,
          knowledgeArea: bncc.areaDoConhecimento,
          segments: bncc.segmentos
        })),
        formativeTracks: {
          id: '',
          tracks: []
        }
      },
      complexity: question.complexidade,
      content: {
        introductoryText: {
          body: question.conteudo?.campos?.length ? question.conteudo.campos[0].textoIntrodutorio : '',
          hasVisualElement: false
        },
        supportText: {
          body: '',
          hasVisualElement: false
        },
        fields: question.conteudo?.campos?.map((campo) => ({
          statement: {
            body: campo.enunciado?.corpo,
            text: campo.enunciado?.texto,
            hasVisualElement: false,

          },
          format: this.formatMapper(campo.formato),
          alternatives: campo.alternativas?.map((alternativa) => ({
            order: alternativa.ordem,
            label: alternativa.label,
            body: alternativa.corpo,
            correct: alternativa.correta,
            nominalValue: alternativa.valorNominal,
            realValue: alternativa.valorReal,
            justification: alternativa.justificativa,
            charLimit: alternativa.limiteCaracteres,
            isNumericAnswer: alternativa.respostaNumericas,
            hasVisualElement: false
          }))
        })),
        solution: {
          body: question.conteudo?.resolucao?.corpo,
          hasVisualElement: false,
          answer: question.conteudo?.resolucao?.resposta
        }
      },
      relatedProject: {
        id: 0,
        label: ''
      },
      status: question.status,
      origin: {
        type: this.originMapper(question.origem?.tipo),
        external: question.origem?.externos.map((externo) => ({
          source: externo.fonte,
          sublevels: externo.subniveis.map((subnivel) => ({
            code: subnivel.codigo,
            level: subnivel.nivel,
          }))
        }))
      },
      year: question.ano,
      history: [],
      questionUsed: false,
      anchorQuestion: false,
      questionCycle: 0,
      transversalTheme: '',
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    return output;
  }
}