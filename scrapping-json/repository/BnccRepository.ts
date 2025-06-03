import { BNCC } from "../enitties/bncc"
import { BnccSchema } from "../enitties/bnccSchema"


export class BnccRepository {
  async SearchBySkill(skillCode: string): Promise<number> {
    const response = await BnccSchema.findOne<BNCC>({
      'skill.code': skillCode
    })

    if (!response) {
      return 0
    }


    return response.specificCompetence[0].number
  }
}