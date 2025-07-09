import { QuestionFTD } from "../enitties/questionFTD";
import { QuestionSchema } from "../enitties/questionSchema";
import { BnccRepository } from "./BnccRepository";

export class QuestionRepository {
  constructor(
    private bnccRepository: BnccRepository
  ) {

  }

  formatCompetenceMapper(competence: string | undefined) {
    switch (competence) {
      case 'C1': return 'Competência de área 1'
      case 'C2': return 'Competência de área 2'
      case 'C3': return 'Competência de área 3'
      case 'C4': return 'Competência de área 4'
      case 'C5': return 'Competência de área 5'
      case 'C6': return 'Competência de área 6'
      case 'C7': return 'Competência de área 7'
      case 'C8': return 'Competência de área 8'
      case 'C9': return 'Competência de área 9'
    }
  }

  async insertMany(data: any) {
    const last = await QuestionSchema.findOne()
      .sort({ aggregatedId: -1 })
      .select('aggregatedId')
      .lean();

    let currentId = last?.aggregatedId ?? 0;

    const questionsAux = data.map((item) => {
      currentId += 1;
      return {
        ...item,
        aggregatedId: currentId,
      };
    });

    const response = await QuestionSchema.insertMany(questionsAux);
    return response.length;
  }

  async updateMany(data: QuestionFTD[]) {
    for (const question of data) {
      const bncc = question.classification?.bncc;
      const enem = question.classification?.enem

      if (bncc) {
        for (const bnccItem of bncc) {
          const competenceNumber = await this.bnccRepository.SearchBySkill(bnccItem.skillCode);

          await QuestionSchema.updateOne(
            { aggregatedId: question.aggregatedId },
            {
              $set: {
                'classification.bncc.$[elem].competenceNumber': competenceNumber
              }
            },
            {
              arrayFilters: [{ 'elem.skillCode': bnccItem.skillCode }]
            }
          );
        }
      }

      if (enem) {
        for (const enemItem of enem) {
          const fullCompetence = this.formatCompetenceMapper(enemItem.competence.code);
          await QuestionSchema.updateOne(
            { aggregatedId: question.aggregatedId },
            {
              $set: {
                'classification.enem.$[elem].competence.code': fullCompetence
              }
            },
            {
              arrayFilters: [{ 'elem.competence.code': enemItem.competence.code }]
            }
          );
        }
      }
    }
  }
}