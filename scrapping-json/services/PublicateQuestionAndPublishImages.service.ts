import fs from 'node:fs';
import path from "node:path";
import { env } from '../env';
import { QuestionRepository } from "../repository/QuestionRepository";
import { BlobServiceClient } from '@azure/storage-blob';
import { ApiRepository } from "../repository/ApiRepository";
import { Question } from "../enitties/questionFTD";
import { JsonToFtdSchemaMapper } from '../mappers/json-to-ftd.mapper';
import { getBncc, getEnem, getMarista, getSaeb, parseClassification } from './utils/PrepareExtractClassification';
import { ask } from './utils/ReadLine';

function replaceImageSources(html: string, imageMap: Record<string, string>): string {
  return html.replace(/<img\s+[^>]*src=["']([^"']+)["']/g, (match, src) => {
    const fileName = path.basename(src);
    return imageMap[fileName] ? match.replace(src, imageMap[fileName]) : match;
  });
}

function getMimeType(ext: string): string {
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
  };
  return types[ext.toLowerCase()] || 'application/octet-stream';
}

const INPUT_DIR = `../../input/${env.INPUT_TO_ARCHIVE}`;

export class PublicateQuestionAndPublishImagesService {
  constructor(
    private questionRepository: QuestionRepository,
    private apiRepository: ApiRepository
  ) { }

  private async getBlobContainerClient(): Promise<ReturnType<BlobServiceClient['getContainerClient']>> {
    const { writeSaasToken } = await this.apiRepository.generateQuestionSaasToken();
    const blobServiceClient = new BlobServiceClient(`${env.AZURE_STORAGE_URL}?${writeSaasToken.token}`);
    return blobServiceClient.getContainerClient(env.AZURE_STORAGE_CONTAINER_NAME);
  }

  private async uploadImages(): Promise<Record<string, string>> {
    const containerClient = await this.getBlobContainerClient();

    const dirPath = path.join(__dirname, INPUT_DIR);
    const files = fs.readdirSync(dirPath);
    const imageMap: Record<string, string> = {};

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

      const filePath = path.join(dirPath, file);
      const buffer = fs.readFileSync(filePath);
      const blobClient = containerClient.getBlockBlobClient(file);

      await blobClient.uploadData(buffer, {
        blobHTTPHeaders: { blobContentType: getMimeType(ext) },
      });

      imageMap[file] = blobClient.url.split('?')[0];
    }

    return imageMap;
  }

  private updateFieldImageSources(field?: { body?: string; hasVisualElement?: boolean }, imageMap?: Record<string, string>) {
    if (field?.hasVisualElement && field.body && imageMap) {
      field.body = replaceImageSources(field.body, imageMap);
    }
  }

  async publicateQuestionAndPublishImages() {
    const usarJsonClassificado = (await ask('já possui o JSON com classification? (s/n): ')).toLowerCase() === 's';

    let questions: Question[];
    const outputJsonPath = path.join(__dirname, `${INPUT_DIR}/saida_com_classification.json`);

    if (usarJsonClassificado) {
      if (!fs.existsSync(outputJsonPath)) {
        throw new Error(`Arquivo classificado não encontrado: ${outputJsonPath}`);
      }

      questions = JSON.parse(fs.readFileSync(outputJsonPath, 'utf-8'));
    } else {
      const response = await this.apiRepository.login(env.EMAIL, env.PASSWORD);
      if (!response.accessToken) {
        throw new Error('Falha ao obter o token de acesso');
      }

      const imageMap = await this.uploadImages();

      const inputJsonPath = path.join(__dirname, `${INPUT_DIR}/saida_final_processado.json`);
      if (!fs.existsSync(inputJsonPath)) {
        throw new Error(`Arquivo não encontrado: ${inputJsonPath}`);
      }

      questions = JSON.parse(fs.readFileSync(inputJsonPath, 'utf-8'));

      for (const question of questions) {
        const { content } = question;

        this.updateFieldImageSources(content?.introductoryText, imageMap);
        this.updateFieldImageSources(content?.supportText, imageMap);
        this.updateFieldImageSources(content?.solution, imageMap);

        content?.fields?.forEach((field) => {
          this.updateFieldImageSources(field.statement, imageMap);
          field.alternatives?.forEach((alt) => this.updateFieldImageSources(alt, imageMap));
        });

        question.classification ??= {};

        let classificationObj: Record<string, string> = {};
        try {
          const classificationStr = question.classification;
          const parse = typeof classificationStr === 'string' ? classificationStr : JSON.stringify(classificationStr);
          classificationObj = parseClassification(parse);
        } catch (err) {
          console.warn(`Erro ao parsear classificação da questão ${question.id}`);
          return;
        }

        console.log(`Processando questão ${question.id} com classificação:`, classificationObj);

        await Promise.all([
          getBncc(question, classificationObj, this.apiRepository),
          getEnem(question, classificationObj, this.apiRepository),
          getMarista(question, classificationObj, this.apiRepository),
          getSaeb(question, classificationObj, this.apiRepository)
        ]);
      }

      fs.writeFileSync(outputJsonPath, JSON.stringify(questions, null, 2), 'utf-8');
    }

    console.log('\nClassificação finalizada.');
    console.log('Revise o JSON gerado antes de continuar.');
    await ask('Pressione Enter para continuar com a publicação das questões...');

    console.log('Iniciando publicação das questões...');

    const mapper = new JsonToFtdSchemaMapper();
    const questionsaux = mapper.execute(questions);

    const insertedCount = await this.questionRepository.insertMany(questionsaux);
    console.log(`Publicadas ${insertedCount} questões com sucesso!`);
  }
}