import fs from 'node:fs';
import path from "node:path";
import { PoliedroToFtdSchemaMapper } from "../mappers/poliedro-to-ftd.mapper";
import { QuestionRepository } from "../repository/QuestionRepository";
import { env } from '../env';
import readLine from 'node:readline';


export class ReadAndWriteFileService {
  constructor(
    private mapper: PoliedroToFtdSchemaMapper,
    private questionRepository: QuestionRepository
  ) { }

  async readAndWriteFile() {
    const rl = readLine.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    console.log('Encontrando caminho do arquivo de entrada...')
    const inputjson = path.join(__dirname, `../input/${env.INPUT_PATH}.json`)
    console.log('Arquivo encontrado com sucesso!')

    console.log('Iniciando o processo de leitura e escrita de arquivo na pasta input...')
    const jsonFile = JSON.parse(fs.readFileSync(inputjson, 'utf-8'))

    console.log('Mapeando valores do arquivo.')
    const output = this.mapper.excecute(jsonFile)
    console.log('Valores mapeados com sucesso, estamos criando o arquivo de saida...')
    const outputjsonPath = path.join(__dirname, '../output/')

    fs.writeFileSync(`${outputjsonPath}output.json`, JSON.stringify(output), 'utf-8')
    console.log('Arquivo de saida na pasta output.')

    rl.question('Deseja inserir os dados no banco de dados? (s/n)', async (answer) => {
      if (answer.toLowerCase() === 's') {
        console.log('Iniciando o processo de inserção no banco de dados...')
        await this.questionRepository.insertMany(output)
        console.log('Dados inseridos com sucesso!')
      } else {
        console.log('Processo de inserção no banco de dados cancelado.')
      }
      rl.close()
    })

  }
}