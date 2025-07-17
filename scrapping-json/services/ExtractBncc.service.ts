import fs from 'node:fs';
import path from "node:path";
import { env } from '../env';
import { BnccPoliedroFTDSchemaMapper } from '../mappers/bncc-poliedro-ftd.mapper';


export class ExtractBnccService {
  constructor(
    private mapper: BnccPoliedroFTDSchemaMapper,
  ) { }

  async extractBncc() {
    console.log('Encontrando caminho do arquivo de entrada...')
    const inputjson = path.join(__dirname, `../input/${env.ARVORE_BNCC}.json`)
    console.log('Arquivo encontrado com sucesso!')

    console.log('Encontrando caminho do arquivo de arvore BNCC...')
    const treejson = path.join(__dirname, `../input/competencias_bncc.json`)
    console.log('Arquivo encontrado com sucesso!')

    console.log('Iniciando o processo de leitura e escrita de arquivo na pasta input...')
    const jsonFile = JSON.parse(fs.readFileSync(inputjson, 'utf-8'))
    const treeBnccFile = JSON.parse(fs.readFileSync(treejson, 'utf-8'))

    console.log('Mapeando valores do arquivo.')
    const output = this.mapper.excecute(jsonFile, treeBnccFile)
    console.log('Valores mapeados com sucesso, estamos criando o arquivo de saida...')
    const outputjsonPath = path.join(__dirname, '../output/')

    fs.writeFileSync(`${outputjsonPath}output.json`, JSON.stringify(output), 'utf-8')
    console.log('Arquivo de saida na pasta output.')

  }
}