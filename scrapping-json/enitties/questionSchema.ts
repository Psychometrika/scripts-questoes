import { Schema, model } from 'mongoose';

const Question = new Schema({
  id: { type: String, required: true },
  aggregatedId: { type: Number },
  knowledgeArea: {
    type: String,
    enum: [
      'Linguagens, Códigos e suas Tecnologias',
      'Ciências Humanas e suas Tecnologias',
      'Ciências da Natureza e suas Tecnologias',
      'Matemática e suas Tecnologias',
    ],
  },
  subject: {
    type: String,
    enum: [
      'Língua Portuguesa', 'Matemática', 'História', 'Geografia', 'Biologia',
      'Educação Física', 'Arte', 'Filosofia', 'Sociologia', 'Física', 'Ciências',
      'Ensino Religioso', 'Língua Inglesa', 'Química', 'Língua Espanhola', 'Produção De Texto'
    ],
  },
  stage: {
    type: String,
    enum: ['EI', 'EFAI', 'EFAF', 'EM', 'PV'],
  },
  classification: { type: Schema.Types.Mixed }, // Pode ser expandido
  complexity: {
    type: String,
    enum: ['Muito Fácil', 'Fácil', 'Intermediário', 'Difícil', 'Muito Difícil'],
  },
  content: { type: Schema.Types.Mixed }, // Pode ser expandido
  relatedProject: {
    id: Number,
    label: String,
  },
  status: {
    type: Number,
    enum: [0, 1, 2, 3],
    required: true,
  },
  origin: { type: Schema.Types.Mixed }, // Pode ser expandido
  year: [String],
  history: [String],
  questionUsed: { type: Boolean, required: true },
  anchorQuestion: { type: Boolean, required: true },
  questionCycle: Number,
  transversalTheme: String,
  createdBy: String,
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date },
});

export const QuestionSchema = model('questions', Question);