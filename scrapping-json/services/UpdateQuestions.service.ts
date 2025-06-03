import fs from 'node:fs';
import path from "node:path";
import { PoliedroToFtdSchemaMapper } from "../mappers/poliedro-to-ftd.mapper";
import { QuestionRepository } from "../repository/QuestionRepository";
import { env } from '../env';
import readLine from 'node:readline';
import { BnccRepository } from '../repository/BnccRepository';


export class UpdateQuestionService {
  constructor(private questionRepository: QuestionRepository) { }

  async update() {

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