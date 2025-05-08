import fs from 'fs'
import path from 'path'
import { PoliedroToFtdSchemaMapper } from './mappers/poliedro-to-ftd.mapper'



const inputjson = path.join(__dirname, './input/enem-dev.json')

const mapper = new PoliedroToFtdSchemaMapper()

const jsonFile = JSON.parse(fs.readFileSync(inputjson, 'utf-8'))

const output = mapper.excecute(jsonFile)

const outputjson = path.join(__dirname, './output/enem-dev.json')


