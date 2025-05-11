import { read } from "fs";
import { connectToMongoDB } from "./config";
import { PoliedroToFtdSchemaMapper } from "./mappers/poliedro-to-ftd.mapper";
import { QuestionRepository } from "./repository/QuestionRepository";
import { ReadAndWriteFileService } from "./services/ReadAndWriteFile.service";

async function execute() {
  await connectToMongoDB()

  const mapper = new PoliedroToFtdSchemaMapper()
  const questionRepository = new QuestionRepository()

  const readAndWriteFileService = new ReadAndWriteFileService(mapper, questionRepository)

  await readAndWriteFileService.readAndWriteFile()
}

execute()