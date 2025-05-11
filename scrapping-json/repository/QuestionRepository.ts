import { QuestionFTD } from "../enitties/questionFTD";
import { QuestionSchema } from "../enitties/questionSchema";

export class QuestionRepository {
  async insertMany(data: any) {
    const response = await QuestionSchema.insertMany(data)

    return response.length
  }
}