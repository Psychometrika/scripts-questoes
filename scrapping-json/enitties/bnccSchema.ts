import { Schema, model } from 'mongoose';
import { EBNCCKnowledgeArea, SpecificCompetence, Skill } from './bncc';


const specificCompetenceSchema = new Schema<SpecificCompetence>({
  number: { type: Number, required: true },
  description: { type: String, required: true }
}, { _id: false });

const skillSchema = new Schema<Skill>({
  code: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const bncc = new Schema({
  knowledgeArea: {
    type: Number,
    enum: Object.values(EBNCCKnowledgeArea).filter(v => typeof v === 'number'),
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  specificCompetence: {
    type: [specificCompetenceSchema],
    required: true
  },
  skill: {
    type: skillSchema,
    required: true
  }
});

export const BnccSchema = model('bncc', bncc);