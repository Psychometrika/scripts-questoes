import fs from 'node:fs';
import path from "node:path";
import { env } from '../env';
import { QuestionRepository } from "../repository/QuestionRepository";
import { BlobServiceClient } from '@azure/storage-blob'
import { randomUUID } from 'crypto'


export class PublicateQuestionAndPublishImagesService {
  constructor(private questionRepository: QuestionRepository) { }

  uploadAdapter(loader: any) {
    return {
      upload: () => {
        // biome-ignore lint/suspicious/noAsyncPromiseExecutor: <explanation>
        return new Promise(async (resolve, reject) => {
          try {
            const file: File = await loader.file

            const body = new FormData()
            body.append('uploadImg', file)

            const uniqueId = randomUUID()
            const fileNameSanitized = file.name.replace(/\s+/g, '_')
            const blobName = `${uniqueId}-${fileNameSanitized}`

            const { writeSaasToken } = await generateQuestionSaasToken()

            const URL_BLOB = env.AZURE_STORAGE_URL

            const saasToken = writeSaasToken.token

            const blobServiceClient = new BlobServiceClient(
              `${URL_BLOB}?${saasToken}`
            )

            const containerClient = blobServiceClient.getContainerClient(
              env.AZURE_STORAGE_CONTAINER_NAME
            )

            const blobClient = containerClient.getBlockBlobClient(blobName)

            await blobClient.uploadData(file, {
              blobHTTPHeaders: { blobContentType: file.type },
            })

            const urlImg = blobClient.url.split('?')[0]

            resolve({
              default: urlImg,
            })

          } catch (error) {
            // biome-ignore lint/suspicious/noConsole: <explanation>
            reject(error)
          }
        })
      },
    }
  }

  async publicateQuestionAndPublishImages() {

    console.log('Encontrando caminho do arquivo de entrada...')
    const inputjson = path.join(__dirname, `../input/${env.INPUT_TO_UPDATE}.json`)
    console.log('Arquivo encontrado com sucesso!')

    console.log('Iniciando o processo de leitura e escrita de arquivo na pasta input...')
    const jsonFile = JSON.parse(fs.readFileSync(inputjson, 'utf-8'))
    console.log('Finalizando o processo de leitura e escrita de arquivo na pasta input...')

    console.log('Iniciando update no banco!')
    await this.questionRepository.updateMany(jsonFile)
    console.log('Finalizado update no banco!')

  }
}