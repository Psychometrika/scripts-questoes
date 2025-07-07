import fs from 'node:fs';
import path from "node:path";
import { env } from '../env';
import { QuestionRepository } from "../repository/QuestionRepository";
import { BlobServiceClient } from '@azure/storage-blob';
import { ApiRepository } from "../repository/ApiRepository";
import { Question } from "../enitties/questionFTD";

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
    const response =  await this.apiRepository.login(env.EMAIL, env.PASSWORD);
    if (!response.accessToken) {
      throw new Error('Falha ao obter o token de acesso');
    }

    const imageMap = await this.uploadImages();

    const inputJsonPath = path.join(__dirname, `${INPUT_DIR}/saida_final_processado.json`);
    if (!fs.existsSync(inputJsonPath)) {
      throw new Error(`Arquivo não encontrado: ${inputJsonPath}`);
    }

    const questions: Question[] = JSON.parse(fs.readFileSync(inputJsonPath, 'utf-8'));

    for (const question of questions) {
      const { content } = question;

      this.updateFieldImageSources(content?.introductoryText, imageMap);
      this.updateFieldImageSources(content?.supportText, imageMap);
      this.updateFieldImageSources(content?.solution, imageMap);
      this.updateFieldImageSources(content?.solution, imageMap);

      content?.fields?.forEach((field) => {
        this.updateFieldImageSources(field.statement, imageMap);
        field.alternatives?.forEach((alt) => this.updateFieldImageSources(alt, imageMap));
      });
    }

    const outputJsonPath = path.join(__dirname, `${INPUT_DIR}/saida_com_classification.json`);

    fs.writeFileSync(outputJsonPath, JSON.stringify(questions, null, 2), 'utf-8');

    console.log('iniciando publicação das questões...');
  }
}