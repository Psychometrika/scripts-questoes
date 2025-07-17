import { Question } from "../../enitties/questionFTD";
import { ApiRepository } from "../../repository/ApiRepository";
import fs from 'fs/promises';

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
    // console.warn(`Erro ao buscar BNCC Tree para ${code}`, e);

    const status = e?.response?.status || e?.statusCode || e?.status;
    const is404 = status === 404 || (typeof e?.message === 'string' && e.message.includes('404'));

    if (is404) {
      try {
        await fs.appendFile('bncc-404.txt', code + '\n');
      } catch (fsErr) {
        console.error('Erro ao salvar código 404 no arquivo:', fsErr);
      }
    }
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
    // console.warn(`Erro ao buscar ENEM Tree para código ${code}`, e);
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
    // console.warn(`Erro ao buscar Marista Tree para código ${code}`, e);
    const status = e?.response?.status || e?.statusCode || e?.status;
    const is404 = status === 404 || (typeof e?.message === 'string' && e.message.includes('404'));
    if (is404) {
      try {
        await fs.appendFile('marista-404.txt', code + '\n');
      } catch (fsErr) {
        console.error('Erro ao salvar código 404 no arquivo:', fsErr);
      }
    }
  }
}

export async function getSaeb(
  question: Question,
  classificationObj: Record<string, string>,
  apiRepository: ApiRepository
) {
  const code = classificationObj['HABILIDADE SAEB'];
  if (!code) return;

  try {
    const apiResp = await apiRepository.getSaebTree({ code });

    if (Array.isArray(apiResp.saeb)) {
      let classificationObjFull: Record<string, any>;

      if (typeof question.classification === 'string') {
        try {
          classificationObjFull = JSON.parse(question.classification);
        } catch {
          classificationObjFull = { ...classificationObj };
        }
      } else {
        classificationObjFull = question.classification ?? {};
      }

      classificationObjFull.saeb = apiResp.saeb;

      question.classification = classificationObjFull;
    }
  } catch (e: any) {
    const status = e?.response?.status || e?.statusCode || e?.status;
    const is404 = status === 404 || (typeof e?.message === 'string' && e.message.includes('404'));

    if (is404) {
      // console.warn(`Código SAEB não encontrado (404): ${code}`);
      try {
        await fs.appendFile('saeb-404.txt', code + '\n');
      } catch (fsErr) {
        console.error('Erro ao salvar código SAEB 404 no arquivo:', fsErr);
      }
    } else {
      console.error(`Erro ao buscar SAEB Tree para ${code}`, e);
    }
  }
}

export function parseClassification(classification: string): Record<string, string> {
  try {
    const parsed = JSON.parse(classification);
    if (typeof parsed === 'object' && parsed !== null) {
      const result: Record<string, string> = {};
      extractRelevantFields(parsed, result);
      if (Object.keys(result).length > 0) {
        return result;
      }
    }
  } catch (e) {
    console.warn('Erro ao analisar JSON:');
    const fixedJson = tryToFixMalformedJson(classification);
    if (fixedJson) {
      try {
        const parsed = JSON.parse(fixedJson);
        const result: Record<string, string> = {};

        extractRelevantFields(parsed, result);

        if (Object.keys(result).length > 0) {
          return result;
        }
      } catch { }
    }
  }

  const result: Record<string, string> = {};
  const lines = classification.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();

    const bnccMatch = trimmed.match(/HABILIDADE\s+BNCC\s*[:：]?\s*([A-Z0-9]+)/i);
    if (bnccMatch) {
      result["HABILIDADE BNCC"] = bnccMatch[1].trim();
      continue;
    }

    const maristaMatch = trimmed.match(/HABILIDADE\s+MARISTA\s*[:：]?\s*(H[\w\d]+)\s*\(([^)]+)\)/i);
    if (maristaMatch) {
      const codeClean = `${maristaMatch[1]}(${maristaMatch[2]})`;
      result["HABILIDADE MARISTA"] = codeClean;
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

function extractRelevantFields(source: Record<string, any>, target: Record<string, string>) {
  for (const key in source) {
    const upperKey = key.toUpperCase();
    const value = source[key];

    if (typeof value !== 'string') continue;

    if (/HABILIDADE\s+BNCC/i.test(upperKey)) {
      const match = value.match(/[A-Z0-9]+/i);
      if (match) target["HABILIDADE BNCC"] = match[0].trim();
    }
    else if (/HABILIDADE\s+SAEB/i.test(upperKey)) {
      const match = value.match(/^([^-]+)/);
      if (match) {
        target["HABILIDADE SAEB"] = match[1].trim();
      }
    }
    else if (/HABILIDADE\s+MARISTA/i.test(upperKey)) {
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

function tryToFixMalformedJson(input: string): string | null {
  try {
    const match = input.match(/^\{.*\}$/s);
    if (!match) return null;

    const parts = input
      .replace(/^{|}$/g, '')
      .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
      .map(part => part.trim())
      .filter(part => part.includes(':'))

    const fixedObject: Record<string, string> = {};

    for (const part of parts) {
      const [rawKey, ...rawValueParts] = part.split(':');
      if (!rawKey || rawValueParts.length === 0) continue;

      const key = rawKey.trim().replace(/^"+|"+$/g, '');
      const value = rawValueParts.join(':').trim().replace(/^"+|"+$/g, '');

      if (key && value) {
        fixedObject[key] = value;
      }
    }

    return JSON.stringify(fixedObject);
  } catch {
    return null;
  }
}