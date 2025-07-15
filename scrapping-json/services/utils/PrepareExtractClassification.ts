import { Question } from "../../enitties/questionFTD";
import { ApiRepository } from "../../repository/ApiRepository";


export async function getBncc(
  question: Question,
  classificationObj: Record<string, string>,
  apiRepository: ApiRepository
) {
  const code = classificationObj['HABILIDADE BNCC'];
  if (!code) return;

  try {
    const apiResp = await apiRepository.getBnccTree({ code });
    if (Array.isArray(apiResp.bncc)) {
      let classificationObjFull: Record<string, any>;
      if (typeof question.classification === 'string') {
        try {
          classificationObjFull = JSON.parse(question.classification);
        } catch {
          classificationObjFull = {};
        }
      } else {
        classificationObjFull = question.classification ?? {};
      }

      classificationObjFull.bncc = apiResp.bncc.map(item => ({
        id: item.id,
        skillCode: item.skillCode,
        skill: item.skill,
        knowledgeArea: item.knowledgeArea,
        competenceNumber: typeof item.competenceNumber === 'number' ? item.competenceNumber : 0,
        segments: item.segments,
      }));

      question.classification = classificationObjFull;
    }
  } catch (e) {
    console.warn(`Erro ao buscar BNCC Tree para ${code}`, e);
  }
}

export async function getEnem(
  question: Question,
  classificationObj: Record<string, string>,
  apiRepository: ApiRepository
) {
  const code = classificationObj['Código ENEM'];
  const area = question.knowledgeArea;
  if (!code || !area) return;

  try {
    const apiResp = await apiRepository.getEnemTree({ knowledgeArea: area, code });
    if (Array.isArray(apiResp.enem)) {
      let classificationObjFull: Record<string, any>;
      if (typeof question.classification === 'string') {
        try {
          classificationObjFull = JSON.parse(question.classification);
        } catch {
          classificationObjFull = {};
        }
      } else {
        classificationObjFull = question.classification ?? {};
      }

      classificationObjFull.enem = apiResp.enem.map(item => ({
        id: item.id,
        code: item.code,
        knowledgeArea: item.knowledgeArea,
        competence: item.competence,
        skill: item.skill,
        segments: item.segments
      }));

      question.classification = classificationObjFull;
    }
  } catch (e) {
    console.warn(`Erro ao buscar ENEM Tree para código ${code}`, e);
  }
}

export async function getMarista(
  question: Question,
  classificationObj: Record<string, string>,
  apiRepository: ApiRepository
) {
  const code = classificationObj['HABILIDADE MARISTA'];
  if (!code) return;

  try {
    const apiResp = await apiRepository.getMaristaTree({ code });
    if (Array.isArray(apiResp.marista)) {
      let classificationObjFull: Record<string, any>;
      if (typeof question.classification === 'string') {
        try {
          classificationObjFull = JSON.parse(question.classification);
        } catch {
          classificationObjFull = {};
        }
      } else {
        classificationObjFull = question.classification ?? {};
      }

      classificationObjFull.marista = apiResp.marista.map(item => ({
        id: item.id,
        type: item.type,
        levels: item.levels.map(lvl => ({
          id: lvl.id,
          code: lvl.code,
          level: lvl.level
        }))
      }));

      question.classification = classificationObjFull;
    }
  } catch (e) {
    console.warn(`Erro ao buscar Marista Tree para código ${code}`, e);
  }
}

// Regex patterns para caso fuja do padrão JSON
export function parseClassification(classification: string): Record<string, string> {
  const result: Record<string, string> = {};

  try {
    const parsed = JSON.parse(classification);
    if (typeof parsed === 'object') {
      extractRelevantFields(parsed, result);
      return result;
    }
  } catch (_) {}

  const lines = classification.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    const bnccMatch = trimmed.match(/HABILIDADE\s+BNCC\s*[:：]?\s*([A-Z0-9]+)/i);
    if (bnccMatch) {
      result["HABILIDADE BNCC"] = bnccMatch[1].trim();
      continue;
    }

    const maristaMatch = trimmed.match(/HABILIDADE\s+MARISTA\s*[:：]?\s*(H[\w\d]+)/i);
    if (maristaMatch) {
      result["HABILIDADE MARISTA"] = maristaMatch[1].trim();
      continue;
    }

    const habMatch = trimmed.match(/HABILIDADE\s*[:：]?\s*([A-Z0-9]+)/i);
    if (habMatch) {
      result["HABILIDADE"] = habMatch[1].trim();
      continue;
    }

    if (/C\d+\s*\|\s*H\d+/i.test(trimmed)) {
      result["CÓDIGOS"] = trimmed;
      continue;
    }

    const enemMatch = trimmed.match(/CÓDIGO\s+ENEM\s*[:：]?\s*(C\d+\s*\|\s*H\d+)/i);
    if (enemMatch) {
      const codeMatch = enemMatch[1].match(/\|\s*(H\d+)/i);
      if (codeMatch) {
        result["Código ENEM"] = codeMatch[1].trim();
      }
      continue;
    }
  }

  return result;
}

function extractRelevantFields(source: Record<string, string>, target: Record<string, string>) {
  for (const key in source) {
    const upperKey = key.toUpperCase();
    const value = source[key];

    if (typeof value !== 'string') continue;

    if (/HABILIDADE\s+BNCC/i.test(upperKey)) {
      const match = value.match(/[A-Z0-9]+/i);
      if (match) target["HABILIDADE BNCC"] = match[0].trim();
    } else if (/HABILIDADE\s+MARISTA/i.test(upperKey)) {
      target["HABILIDADE MARISTA"] = value.trim();
    } else if (/HABILIDADE/i.test(upperKey)) {
      target["HABILIDADE"] = value.trim();
    } else if (/CÓDIGO\s+ENEM/i.test(upperKey)) {
      const match = value.match(/\|\s*(H\d+)/i);
      if (match) target["Código ENEM"] = match[1].trim();
    } else if (/C\d+\s*\|\s*H\d+/i.test(value)) {
      target["CÓDIGOS"] = value.trim();
    }
  }
}