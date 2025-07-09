import { Types } from 'mongoose';
import {
  Format, Subject, KnowledgeArea, Stage,
  Complexity, Status, Year, OriginType,
  Question, Classification, Content, RelatedProject,
  StatusHistory
} from '../enitties/questionFTD';

type InputJson = any;


export class JsonToFtdSchemaMapper {
  formatMapper(format?: string): Format {
    switch (format) {
      case Format.SINGLE_ANSWER: return Format.SINGLE_ANSWER;
      case Format.ESSAY: return Format.ESSAY;
      case Format.ESSAY_MULTIPLE_ASK: return Format.ESSAY_MULTIPLE_ASK;
      case Format.MULTIPLE_ANSWER: return Format.MULTIPLE_ANSWER;
      case Format.TRUE_OR_FALSE: return Format.TRUE_OR_FALSE;
      case Format.ESSAY_SHEET: return Format.ESSAY_SHEET;
      case Format.HTML: return Format.HTML;
      case Format.GAP: return Format.GAP;
      case Format.SUM: return Format.SUM;
      default: return Format.SINGLE_ANSWER;
    }
  }

  mapQuestion(input: InputJson): Question {
    const classification: Classification = {
      traditional: [],
      enem: input.classification?.enem?.map((e: any) => ({
        id: e.id,
        code: e.code,
        competence: {
          code: e.competence?.code,
          description: e.competence?.description
        },
        skill: {
          code: e.skill?.code,
          description: e.skill?.description
        },
        knowledgeArea: e.knowledgeArea,
        segments: e.segments || []
      })) || [],
      bncc: input.classification?.bncc?.map((b: any) => ({
        id: b.id,
        skillCode: b.skillCode,
        skill: b.skill,
        competenceNumber: b.competenceNumber,
        knowledgeArea: b.knowledgeArea,
        segments: b.segments || [],
      })) || [],
      topics: [],
      marista: input.classification?.marista?.map((m: any) => ({
        id: m.id,
        type: m.type,
        levels: m.levels?.map((l: any) => ({
          id: l.id,
          code: l.code,
          level: l.level
        })) || [],
      })),
      saeb: input.classification?.saeb?.map((s: any) => ({
        id: s.id,
        knowledgeArea: s.knowledgeArea,
        levels: s.levels?.map((l: any) => ({
          id: l.id,
          code: l.code,
          level: l.level
        })) || []
      })) || [],
      formativeTracks: { id: '', tracks: [] }
    };

    const content: Content = {
      introductoryText: {
        body: input.content?.introductoryText?.body || '',
        hasVisualElement: input.content?.introductoryText?.hasVisualElement ?? false,
      },
      supportText: {
        body: input.content?.supportText?.body || '',
        hasVisualElement: input.content?.supportText?.hasVisualElement ?? false,
      },
      fields: input.content?.fields?.map((f: any) => ({
        statement: {
          body: f.statement?.body || '',
          text: f.statement?.text || '',
          hasVisualElement: f.statement?.hasVisualElement ?? false,
        },
        format: this.formatMapper(f.format),
        alternatives: f.alternatives?.map((alt: any) => ({
          order: alt.order,
          label: alt.label,
          body: alt.body,
          correct: alt.correct,
          nominalValue: alt.nominalValue,
          realValue: alt.realValue,
          justification: alt.justification,
          charLimit: alt.charLimit,
          isNumericAnswer: alt.isNumericAnswer,
          hasVisualElement: alt.hasVisualElement ?? false,
        })) || [],
      })) || [],
      solution: {
        body: input.content?.solution?.body || '',
        hasVisualElement: input.content?.solution?.hasVisualElement ?? false,
        answer: input.content?.solution?.answer || '',
      }
    };

    const origin = {
      type: input.origin?.type === 'FTD' ? OriginType.FTD : OriginType.EXTERNAL,
      external: input.origin?.external?.map((ext: any) => ({
        source: ext.source,
        sublevels: ext.sublevels?.map((s: any) => ({
          code: s.code,
          level: s.level
        })) || []
      })) || []
    };

    const statusHistory: StatusHistory[] = input.statusHistory?.map((h: any) => ({
      status: h.status,
      timestamp: new Date(h.timestamp)
    })) || [];

    return {
      id: input.id,
      aggregatedId: input.aggregatedId,
      knowledgeArea: input.knowledgeArea as KnowledgeArea,
      subject: input.subject as Subject,
      stage: input.stage as Stage,
      classification,
      complexity: input.complexity as Complexity,
      content,
      relatedProject: input.relatedProject || { id: 0, label: '' } as RelatedProject,
      status: input.status as Status,
      statusHistory,
      origin,
      year: input.year?.map((y: string) => y as Year) || [],
      history: input.history || [],
      questionUsed: input.questionUsed ?? false,
      numericParameters: input.numericParameters || {} as any,
      anchorQuestion: input.anchorQuestion ?? false,
      questionCycle: input.questionCycle,
      transversalTheme: input.transversalTheme || [''],
      createdBy: input.createdBy || 'system',
      creatorId: input.creatorId,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      comments: input.comments
    };
  }

  execute(inputs: InputJson[]): Question[] {
    return inputs.map(i => this.mapQuestion(i));
  }
}
