import readLine from 'node:readline';
import { connectToMongoDB } from "./config";
import { PoliedroToFtdSchemaMapper } from "./mappers/poliedro-to-ftd.mapper";
import { BnccRepository } from "./repository/BnccRepository";
import { QuestionRepository } from "./repository/QuestionRepository";
import { ReadAndWriteFileService } from "./services/ReadAndWriteFile.service";
import { UpdateQuestionService } from './services/UpdateQuestions.service';
import { PublicateQuestionAndPublishImagesService } from './services/PublicateQuestionAndPublishImages.service';

async function execute() {
  await connectToMongoDB()

  const bnccRepository = new BnccRepository()
  const questionRepository = new QuestionRepository(bnccRepository)
  const mapper = new PoliedroToFtdSchemaMapper()

  const readAndWriteFileService = new ReadAndWriteFileService(mapper, questionRepository)
  const updateQuestionService = new UpdateQuestionService(questionRepository)
  const publicateQuestionAndPublishImagesService = new PublicateQuestionAndPublishImagesService(questionRepository)

  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question('o que deseja fazer? \n1 - ler/escrever arquivo \n2 - Update de questões \n3 - Publicar Questões e Imagens', async (answer) => {
    switch (answer) {
      case '1':
        await readAndWriteFileService.readAndWriteFile()
        break;
      case '2':
        await updateQuestionService.update()
        break;
      case '3':
        await publicateQuestionAndPublishImagesService.publicateQuestionAndPublishImages()
        break;
      default:
        'Opção invalida'
        break;
    }
  })

}

execute()