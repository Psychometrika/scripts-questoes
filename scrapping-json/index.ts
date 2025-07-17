import readLine from 'node:readline';
import { connectToMongoDB } from "./config";
import { PoliedroToFtdSchemaMapper } from "./mappers/poliedro-to-ftd.mapper";
import { BnccRepository } from "./repository/BnccRepository";
import { QuestionRepository } from "./repository/QuestionRepository";
import { ReadAndWriteFileService } from "./services/ReadAndWriteFile.service";
import { UpdateQuestionService } from './services/UpdateQuestions.service';
import { PublicateQuestionAndPublishImagesService } from './services/PublicateQuestionAndPublishImages.service';
import { ApiRepository } from './repository/ApiRepository';
import { ExtractBnccService } from './services/ExtractBncc.service';
import { BnccPoliedroFTDSchemaMapper } from './mappers/bncc-poliedro-ftd.mapper';

async function execute() {
  await connectToMongoDB()

  const bnccRepository = new BnccRepository()
  const questionRepository = new QuestionRepository(bnccRepository)
  const mapper = new PoliedroToFtdSchemaMapper()
  const bnccMapper = new BnccPoliedroFTDSchemaMapper()
  const apiRepository = new ApiRepository()

  const readAndWriteFileService = new ReadAndWriteFileService(mapper, questionRepository)
  const updateQuestionService = new UpdateQuestionService(questionRepository)
  const publicateQuestionAndPublishImagesService = new PublicateQuestionAndPublishImagesService(questionRepository, apiRepository)
  const extractBnccService = new ExtractBnccService(bnccMapper)

  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(`o que deseja fazer? 
    \n1 - ler/escrever arquivo 
    \n2 - Update de questões 
    \n3 - Publicar Questões e Imagens 
    \n4 - Extrair classificações bncc`,
    async (answer) => {
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
        case '4':
          await extractBnccService.extractBncc()
          break;
        default:
          'Opção invalida'
          break;
      }
    })

}

execute()