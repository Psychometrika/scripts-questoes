require("dotenv").config();
const mongoose = require("mongoose");
const xlsx = require("xlsx");
const fs = require("node:fs");

// const bnccSchema = new mongoose.Schema({
//     areaConhecimento: String,
//     areaConhecimentoId: String,
//     campoDeAtuacao: String,
//     competenciaEspecifica: String,
//     competenciaGeral: String,
//     componenteCurricular: String,
//     codObjetivoDeApredizagemHabilidade: String,
//     objetivoDeApredizagemHabilidade: String,
//     objetoDeConhecimento: String,
//     praticaDeLinguagem: String,
//     segmentos: [String],
//     unidadesTematicas: String,
// });

// const BNCC = mongoose.model('BNCC', bnccSchema);

// const enemSchema = new mongoose.Schema({
//     areaConhecimento: String,
//     areaConhecimentoId: Number,
//     codPoliedro: String,
//     codigoCompetencia: String,
//     codigoHabilidade: String,
//     competenciaArea: String,
//     habilidade: String,
//     segmentos: [String],
//     shortCode: String,
// });

// const ENEM = mongoose.model('ENEM', enemSchema);

const questionSchema = new mongoose.Schema({
  status: {
    type: Number,
    required: true
  },
  aggregatedId: {
    type: Number,
  },
  stage: {
    type: String,
  },
  year: {
    type: [String],
  },
  knowledgeArea: {
    type: String,
  },
  subject: {
    type: String,
  },
  transversalTheme: {
    type: String,
  },
  origin: {
    type: {
      type: String,
      enum: ['External', 'FTD'],
    },
    external: [
      {
        type: {
          source: {
            type: String,
          },
          sublevels: {
            type: [
              {
                code: { type: String },
                level: { type: Number },
              },
            ],
          },
        },
      },
    ],
  },
  complexity: {
    type: String,
  },
  classification: {
    type: {
      traditional: {
        type: [
          {
            id: { type: String },
            subject: { type: String },
            levels: {
              type: [
                {
                  id: { type: String },
                  code: { type: String },
                  level: { type: Number },
                },
              ],
            },
          },
        ],
      },
      enem: {
        type: [
          {
            id: { type: String },
            code: { type: String },
            competence: {
              type: {
                code: { type: String },
                description: { type: String },
              },
            },
            skill: {
              type: {
                code: { type: String },
                description: { type: String },
              },
            },
            knowledgeArea: { type: String },
            segments: { type: [String] },
          },
        ],
      },
      bncc: {
        type: [
          {
            id: { type: String },
            skillCode: { type: String },
            skill: { type: String },
            knowledgeArea: { type: String },
            segments: {
              type: [String],
            },
          },
        ],
      },
      formativeTracks: {
        type: {
          id: { type: String },
          tracks: { type: [String] }
        },
      }
    }
  },
  content: {
    type: {
      introductoryText: {
        type: {
          body: { type: String },
          hasVisualElement: { type: Boolean }
        }
      },
      supportText: {
        type: {
          body: { type: String },
          hasVisualElement: { type: Boolean }
        }
      },
      fields: [
        {
          type: {
            statement: {
              type: {
                body: {
                  type: String
                },
                text: {
                  type: String
                },
                hasVisualElement: {
                  type: Boolean
                },
              },
            },
            format: {
              type: String,
            },
            alternatives: [
              {
                type: {
                  order: {
                    type: Number,
                  },
                  label: {
                    type: String,
                  },
                  body: {
                    type: String,
                  },
                  correct: {
                    type: Boolean,
                  },
                  nominalValue: {
                    type: Number,
                  },
                  realValue: {
                    type: Number,
                  },
                  justification: {
                    type: String,
                  },
                  charLimit: {
                    type: Number,
                  },
                  isNumericAnswer: {
                    type: Boolean,
                  },
                  hasVisualElement: {
                    type: Boolean
                  }
                },
              },
            ],
          },
        },
      ],
      solution: {
        type: {
          body: {
            type: String
          },
          answer: {
            type: String
          },
          hasVisualElement: {
            type: Boolean
          }
        },
      },
    }
  },
  solutionDetails: {
    type: {
      solutionId: {
        type: String,
      },
      questionType: {
        type: String,
      },
      referenceBook: {
        type: [
          {
            edition: {
              type: String,
            },
            collection: {
              type: String,
            },
            series: {
              type: String,
            },
            chapterNumber: {
              type: String,
            },
            section: {
              type: String,
            },
          },
        ],
      },
      ftdAssessments: {
        type: {
          educationSystem: {
            type: String,
          },
          batches: { type: [String] },
          questionJustification: {
            type: String,
          },
          parameterA: {
            type: String,
          },
          parameterB: {
            type: String,
          },
          parameterC: {
            type: String,
          },
          bisserial: {
            type: String,
          },
          probabilityRanges: { type: [String] },
        },
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
  },
  lastUpdated: {
    type: Date,
  },
  questionUsed: {
    type: Boolean,
  },
  anchorQuestion: {
    type: Boolean,
  },
  history: {
    type: [String],
  },
  relatedProject: {
    type: {
      id: { type: Number },
      label: { type: String }
    }
  },
  questionCycle: {
    type: Number
  }
});

const Question = mongoose.model("questoes", questionSchema);

async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Conectado ao MongoDB");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
  }
}

async function processSpreadsheet() {
  const workbook = xlsx.readFile("enem-carga-v3.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);
  const questions = [];
  const hierarquiaArray = []; // Mova a criação do array hierarquia para aqui
  const adicionados = new Set(); // Conjunto para evitar duplicação de hierarquias

  for (const row of rows) {
    const opcoes = ["A", "B", "C", "D", "E", "F", "G"];
    const alternativas = [];

    opcoes.forEach((opcao, index) => {
      if (row[`alt${opcao}`]) {
        const alternativa = {
          order: index + 1,
          label: opcao,
          body: row[`alt${opcao}`],
          correct: row[`alt${opcao}-correta`] === 1,
          nominalValue: row[`alt${opcao}-valor`],
          realValue: 0,
          justification: "",
          charLimit: 0,
          isNumericAnswer: false,
          hasVisualElement: false,
        };
        alternativas.push(alternativa);
      }
    });

    if (row.TipoQuestao === "Somatório") {
      //console.log('entrou no if')
      const respostaString = row.Resposta;
      const resposta = parseInt(respostaString, 10);

      function encontrarCombinacao(alternativas, alvo, indice = 0, somaAtual = 0, combinacao = []) {
        if (somaAtual === alvo) {
          combinacao.forEach(alt => alt.correta = true);
          return true;
        }
        if (somaAtual > alvo || indice >= alternativas.length) {
          return false;
        }

        if (encontrarCombinacao(alternativas, alvo, indice + 1, somaAtual + alternativas[indice].valorNominal, [...combinacao, alternativas[indice]])) {
          return true;
        }

        return encontrarCombinacao(alternativas, alvo, indice + 1, somaAtual, combinacao);
      }

      // Chamar a função para encontrar a combinação correta
      encontrarCombinacao(alternativas, resposta);
    }

    // function standardizeEnemCode(enemCode) {
    //     if (enemCode.startsWith('CNC')) {
    //         return enemCode.replace('CNC', 'CNTC');
    //     } else if (enemCode.startsWith('LCC')) {
    //         return enemCode.replace('LCC', 'LGGC');
    //     } else if (enemCode.startsWith('MTC')) {
    //         return enemCode.replace('MTC', 'MATC');
    //     } else if (enemCode.startsWith('CHC')) {
    //         return enemCode.replace('CHC', 'CHSC');
    //     } else {
    //         return enemCode;
    //     }
    // }

    // const enem = [];

    // for (let i = 1; i <= 6; i++) {
    //     let enemCode = row[`enem${i}`];
    //     if (enemCode) {
    //         enemCode = standardizeEnemCode(enemCode);
    //         const enemData = await ENEM.findOne({ shortCode: enemCode });
    //         if (enemData) {
    //             const enemDataSimulados = {
    //                 areaConhecimento: enemData.areaConhecimento,
    //                 competencia: `${enemData.codigoCompetencia}`,
    //                 habilidade: `${enemData.codigoHabilidade}`,
    //             };
    //             enem.push(enemDataSimulados);
    //         }
    //     } else {
    //         break;
    //     }
    // }

    // const bncc = [];

    // for (let i = 1; i <= 5; i++) {
    //     const bnccCode = row[`bncc${i}`];
    //     if (bnccCode) {
    //         const bnccData = await BNCC.findOne({ codObjetivoDeApredizagemHabilidade: bnccCode });
    //         if (bnccData) {
    //             const bnccDataSimulados = {
    //                 formato: 0,
    //                 areaConhecimento: bnccData.areaConhecimentoId,
    //                 campoDeAtuacao: bnccData.campoDeAtuacao,
    //                 competencia: bnccData.competenciaEspecifica ? `Competência Específica ${bnccData.competenciaEspecifica}` : '',
    //                 habilidade: bnccData.codObjetivoDeApredizagemHabilidade,
    //                 subdivisao: bnccData.areaConhecimento
    //             }
    //             bncc.push(bnccDataSimulados);
    //         }
    //     } else {
    //         break;
    //     }
    // }

    const tradicionalArray = [];

    // for (let i = 1; i <= 10; i++) {
    //     const arvore = [];
    //     for (let j = 1; j <= 10; j++) {
    //         if (row[`trad${i}-${j}`]) {
    //             arvore.push(row[`trad${i}-${j}`]);
    //         } else {
    //             break;
    //         }
    //     }
    //     if (arvore.length > 0) {
    //         tradicionalArray.push(arvore.reverse());
    //     }
    // }

    // const areaConhecimentoMap = {
    //     "Português": "Linguagens",
    //     "Inglês": "Linguagens",
    //     "Espanhol": "Linguagens",
    //     "Literatura": "Linguagens",
    //     "Artes": "Linguagens",
    //     "Educação Física": "Linguagens",
    //     "Redação": "Linguagens",

    //     "Matemática": "Matemática",

    //     "Física": "Ciências da Natureza",
    //     "Química": "Ciências da Natureza",
    //     "Biologia": "Ciências da Natureza",
    //     "Ciências": "Ciências da Natureza",

    //     "História": "Ciências Humanas",
    //     "Geografia": "Ciências Humanas",
    //     "Filosofia": "Ciências Humanas",
    //     "Sociologia": "Ciências Humanas",
    // };

    // function getAreaConhecimento(disciplina) {
    //     return areaConhecimentoMap[disciplina] || "Área Desconhecida";
    // }

    const tradicional = [];

    for (let i = 1; i <= 10; i++) {
      if (row[`trad${i}-JOIN`]) {
        tradicional.push(row[`trad${i}-JOIN`]);
      }
    }

    const enem = [];
    const bncc = [];

    for (let i = 1; i <= 8; i++) {
      if (row[`matriz${i}-1`] === "ENEM") {
        enem.push(row[`matriz${i}-3`]);
      } else if (row[`matriz${i}-1`] === "BNCC") {
        bncc.push(row[`matriz${i}-3`]);
      }
    }

    // const tradicional = {
    //     areaConhecimento: getAreaConhecimento(row.disciplinaQuestao),
    //     disciplina: row.disciplinaQuestao,
    //     niveis: tradicionalArray,
    // };

    // function adicionarHierarquia(descricao, pai, hierarquia) {
    //     const paiFinal = pai === null && hierarquia === 'niveis' ? tradicional.disciplina : pai;
    //     if (!adicionados.has(descricao)) {
    //         console.log(descricao, paiFinal)
    //         hierarquiaArray.push({ descricao, pai: paiFinal, hierarquia });
    //         adicionados.add(descricao);
    //     }
    // }

    // tradicional.niveis.forEach(nivel => {
    //     let pai = null;
    //     nivel.forEach((descricao) => {
    //         adicionarHierarquia(descricao, pai, "niveis");
    //         pai = descricao;
    //     });
    // });

    // adicionarHierarquia(tradicional.disciplina, getAreaConhecimento(tradicional.disciplina), "disciplina");
    // adicionarHierarquia(tradicional.areaConhecimento, null, "areaConhecimento");

    function mapSegmento(segmentoQuestao) {
      switch (segmentoQuestao) {
        case "Ensino Médio":
          return "EM";
        case "E. Fund. Anos Iniciais ":
          return "EFAI";
        case "E. Fund. Anos Finais":
          return "EFAF";
        default:
          return segmentoQuestao;
      }
    }

    function mapDificuldade(dificuldade) {
      if (dificuldade === "Médio") {
        return "Intermediário";
      }
      return dificuldade;
    }

    /*const campos = {
      vestibular: 3, // coluna 1
      ano: 4, // coluna 2
      dia: 7, // coluna 5
    };*/

    let fontesArray = {};
    const itinerarios = [];
    var itinerarioId = "";
    let fontesLvl1 = new Set()

    for (let i = 1; i <= 6; i++) {
      const fonte = [];
      for (let j = 1; j <= 7; j++) {
        const cellValue = row[`fonte${i}-${j}`];
        if (cellValue && cellValue !== "#N/D") {
          fonte.push(cellValue);
        }
      }
      if (fonte.length > 0) {
        fontesArray[i] = fonte;
      }
    }

    Object.values(fontesArray).forEach(v => {
      fontesLvl1.add(v[0])
    })

    fontesLvl1 = Array.from(fontesLvl1)

    if (row[`matriz1-IF2`] === "Itinerários Formativos") {
      itinerarios[0] = row[`matriz1-IF2`]
      for (let i = 1; i <= 4; i++) {
        const cellValue = row[`matriz1-${i}`];
        itinerarios.push(cellValue)
      }
      var itinerarioId = row[`GUID-IF`]
    }
    var estudar = "";
    var praticar = "";
    var videoAula = "";
    var linkExterno = "";
    var materialDigital = "";
    var pMaisId = "";
    var nomeLivro = "";
    var anoUso = "";
    var pagina = "";
    var disciplina = "";
    var frente = "";
    var capitulo = "";
    var cicloAvaliativoId = "";

    if (typeof row["CicloAvaliativoId"] !== 'undefined') {
      var estudar = row["Estudar"]
      var praticar = row["Praticar"]
      var videoAula = row["VideoAula"]
      var linkExterno = row["LinkExterno"]
      var materialDigital = row["MaterialDigital"]
      var pMaisId = row["PmaisId"]
      var nomeLivro = row["nomeLivro"]
      var anoUso = row["anoUso"]
      var pagina = row["Pagina"]
      var disciplina = row["Disciplina"]
      var frente = row["Frente"]
      var capitulo = row["Capitulo"]
      var cicloAvaliativoId = row["CicloAvaliativoId"]
    }

    const anoSerie = []
    var encontrou = false

    if (row.segmento == "Ensino Médio") {
      anoSerie.push("1ª Série")
      anoSerie.push("2ª Série")
      anoSerie.push("3ª Série")
      encontrou = true
    }

    if (typeof row[`matriz1-${3}`] !== 'undefined' && encontrou == false) {

      if ((row[`matriz1-${3}`]).includes("EF0")) {
        anoSerie.push((row[`matriz1-${3}`]).substring(3, 4) + "º ano")
        encontrou = true
      }

      if ((row[`matriz1-${3}`]).includes("EF12") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        encontrou = true
      }

      if ((row[`matriz1-${3}`]).includes("EF15") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz1-${3}`]).includes("EF35") && encontrou == false) {
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz1-${3}`]).includes("EF67") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        encontrou = true
      }

      if ((row[`matriz1-${3}`]).includes("EF69") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }

      if ((row[`matriz1-${3}`]).includes("EF89") && encontrou == false) {
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }

    }

    if (typeof row[`matriz1-${4}`] !== 'undefined') {
      if (row[`matriz1-${4}`].includes("EF0") && encontrou == false) {
        anoSerie.push(row[`matriz1-${4}`].substring(3, 4) + "º Ano")
        encontrou = true
      }

      if ((row[`matriz1-${4}`]).includes("EF12") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        encontrou = true
      }

      if ((row[`matriz1-${4}`]).includes("EF15") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz1-${4}`]).includes("EF35") && encontrou == false) {
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz1-${4}`]).includes("EF67") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        encontrou = true
      }

      if ((row[`matriz1-${4}`]).includes("EF69") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }

      if ((row[`matriz1-${4}`]).includes("EF89") && encontrou == false) {
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }

    }

    if (typeof row[`matriz2-${3}`] !== 'undefined' && encontrou == false) {
      if (row[`matriz2-${3}`].includes("EF0") && encontrou == false) {
        anoSerie.push(row[`matriz2-${3}`].substring(3, 4) + "º ano")
        encontrou = true
      }

      if ((row[`matriz2-${3}`]).includes("EF12") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        encontrou = true
      }

      if ((row[`matriz2-${3}`]).includes("EF15") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz2-${3}`]).includes("EF35") && encontrou == false) {
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz2-${3}`]).includes("EF67") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        encontrou = true
      }

      if ((row[`matriz2-${3}`]).includes("EF69") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }

      if ((row[`matriz2-${3}`]).includes("EF89") && encontrou == false) {
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }
    }

    if (typeof row[`matriz2-${4}`] !== 'undefined' && encontrou == false) {
      if (row[`matriz2-${4}`].includes("EF0") && encontrou == false) {
        anoSerie.push(row[`matriz2-${4}`].substring(3, 4) + "º ano")
        encontrou = true
      }

      if ((row[`matriz2-${4}`]).includes("EF12") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        encontrou = true
      }

      if ((row[`matriz2-${4}`]).includes("EF15") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz2-${4}`]).includes("EF35") && encontrou == false) {
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz2-${4}`]).includes("EF67") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        encontrou = true
      }

      if ((row[`matriz2-${4}`]).includes("EF69") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }

      if ((row[`matriz2-${4}`]).includes("EF89") && encontrou == false) {
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }
    }

    if (typeof row[`matriz3-${3}`] !== 'undefined' && encontrou == false) {
      if (row[`matriz3-${3}`].includes("EF0") && encontrou == false) {
        anoSerie.push(row[`matriz3-${3}`].substring(3, 4) + "º ano")
        encontrou = true
      }

      if ((row[`matriz3-${3}`]).includes("EF12") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        encontrou = true
      }

      if ((row[`matriz3-${3}`]).includes("EF15") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz3-${3}`]).includes("EF35") && encontrou == false) {
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz3-${3}`]).includes("EF67") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        encontrou = true
      }

      if ((row[`matriz3-${3}`]).includes("EF69") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }

      if ((row[`matriz3-${3}`]).includes("EF89") && encontrou == false) {
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }
    }

    if (typeof row[`matriz3-${4}`] !== 'undefined' && encontrou == false) {
      if (row[`matriz3-${4}`].includes("EF0") && encontrou == false) {
        anoSerie.push(row[`matriz3-${4}`].substring(3, 4) + "º ano")
        encontrou = true
      }

      if ((row[`matriz3-${4}`]).includes("EF12") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        encontrou = true
      }

      if ((row[`matriz3-${4}`]).includes("EF15") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz3-${4}`]).includes("EF35") && encontrou == false) {
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz3-${4}`]).includes("EF67") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        encontrou = true
      }

      if ((row[`matriz3-${4}`]).includes("EF69") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }

      if ((row[`matriz3-${4}`]).includes("EF89") && encontrou == false) {
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }
    }

    if (typeof row[`matriz4-${3}`] !== 'undefined' && encontrou == false) {
      if (row[`matriz4-${3}`].includes("EF0") && encontrou == false) {
        anoSerie.push(row[`matriz4-${3}`].substring(3, 4) + "º ano")
        encontrou = true
      }

      if ((row[`matriz4-${3}`]).includes("EF12") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        encontrou = true
      }

      if ((row[`matriz4-${3}`]).includes("EF15") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz4-${3}`]).includes("EF35") && encontrou == false) {
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz4-${3}`]).includes("EF67") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        encontrou = true
      }

      if ((row[`matriz4-${3}`]).includes("EF69") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }

      if ((row[`matriz4-${3}`]).includes("EF89") && encontrou == false) {
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }
    }

    if (typeof row[`matriz4-${4}`] !== 'undefined' && encontrou == false) {
      if (row[`matriz4-${4}`].includes("EF0") && encontrou == false) {
        anoSerie.push(row[`matriz4-${4}`].substring(3, 4) + "º ano")
        encontrou = true
      }

      if ((row[`matriz4-${4}`]).includes("EF12") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        encontrou = true
      }

      if ((row[`matriz4-${4}`]).includes("EF15") && encontrou == false) {
        anoSerie.push("1º Ano")
        anoSerie.push("2º Ano")
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz4-${4}`]).includes("EF35") && encontrou == false) {
        anoSerie.push("3º Ano")
        anoSerie.push("4º Ano")
        anoSerie.push("5º Ano")
        encontrou = true
      }

      if ((row[`matriz4-${4}`]).includes("EF67") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        encontrou = true
      }

      if ((row[`matriz4-${4}`]).includes("EF69") && encontrou == false) {
        anoSerie.push("6º Ano")
        anoSerie.push("7º Ano")
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }

      if ((row[`matriz4-${4}`]).includes("EF89") && encontrou == false) {
        anoSerie.push("8º Ano")
        anoSerie.push("9º Ano")
        encontrou = true
      }
    }

    //const cellValue = row[`matriz1-${3}`];
    //console.log(cellValue + "-" + cellValue.includes("EF"))
    //console.log(cellValue.substring(3, 4) + "º ano")



    /*for (let i = 1; i <= 6; i++) {
      const fonteObj = {};

      // Iterar sobre as chaves de campos (vestibular, ano, dia)
      for (const [campo, coluna] of Object.entries(campos)) {
        const valorCampo = row[`fonte${i}-${coluna}`]; // Pegar o valor da respectiva coluna
        if (valorCampo) {
          fonteObj[campo] = valorCampo;
        }
      }

      if (Object.keys(fonteObj).length > 0) {
        fontesArray.push(fonteObj);
      }
    }*/
    let tipoOrigem;
    if (row.tipoFonte === "Poliedro") {
      tipoOrigem = "Poliedro";
    } else {
      tipoOrigem = "Interna/Externa";
    }
    /*if (row.tipoFonte === "Poliedro") {
      tipoOrigem = "Sistema de ensino";
    } else if (fontesArray && fontesArray.length > 0) {
      tipoOrigem = "Externo/Vestibular";
    } else {
      tipoOrigem = "Interna/Externa";
    }*/

    /*
                "MultiplaEscolha",
                "Redacao",
                "Dissertativa",
                "Html",
                "VerdadeiroOuFalso",
                "Somatorio",
                "MultiplaEscolhaNotaParcial",
                "DissertativaDeRespostaUnica",
                'Lacuna'
    */
    let tipoQuestao = "";
    tipoQuestao = row.TipoQuestao;

    /*let tipoQuestao;
    if (row.TipoQuestao === "Alternativa") {
      tipoQuestao = "Múltipla Escolha";
    } else if (row.TipoQuestao === "Verdadeiro ou Falso") {
      tipoQuestao = "Verdadeiro ou Falso";
    } else {
      tipoQuestao = row.TipoQuestao;
    }*/

    const errorQuestions = [];
    const sucessQuestions = [];

    async function saveErrorQuestions(errorQuestions) {
      const filePath = './erro_questoes.json'; // Caminho do arquivo JSON
      try {
        // Lê o arquivo existente e adiciona novas questões com erro
        let existingData = [];
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath);
          existingData = JSON.parse(data);
        }

        // Adiciona as novas questões com erro ao array existente
        existingData.push(...errorQuestions);


        // Escreve o novo conteúdo no arquivo JSON
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
        console.log('Questões com erro salvas em erro_questoes.json');
      } catch (err) {
        console.error('Erro ao salvar questões com erro:', err);
      }
    }

    async function saveSucessQuestions(sucessQuestions) {
      const filePath = './sucesso_questoes.json'; // Caminho do arquivo JSON
      try {
        // Lê o arquivo existente e adiciona novas questões com sucesso
        let existingData = [];
        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath);
          existingData = JSON.parse(data);
        }

        // Adiciona as novas questões com erro ao array existente
        existingData.push(...sucessQuestions);

        // Escreve o novo conteúdo no arquivo JSON
        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
        console.log('Questões com sucesso salvas em sucesso_questoes.json');
      } catch (err) {
        console.error('Erro ao salvar questões com sucesso:', err);
      }
    }

    try {
      const [source, ...sublevels] = fontesArray['1'];

      const questionData = {
        status: 1,
        aggregatedId: row.AggregatedId,
        stage: mapSegmento(row.segmento),
        year: anoSerie,
        knowledgeArea: row.areaConhecimentoId,
        subject: row.disciplina,
        transversalTheme: null,
        origin: {
          type: "FTD", //sistema de ensino, externo/vest, interno/simulados
          external: {
            source: source,
            sublevels: sublevels.map((level, index) => {
              return {
                code: level,
                level: index + 1,
              }
            }
            ),
          },
        },
        complexity: mapDificuldade(row.Dificuldade),
        content: {
          introductoryText: {
            body: "",
            hasVisualElement: false,
          },
          supportText: {
            body: "",
            hasVisualElement: false,
          },
          fields: [
            {
              statement: {
                body: row.Enunciado,
                text: row.EnunciadoTexto,
                hasVisualElement: false,
              },
              format: tipoQuestao,
              alternatives: alternativas,
            },
          ],
          solution: {
            body: null,
            answer: null,
            hasVisualElement: false
          },
        },
        solutionDetails: {
          //nao vem da planilha a principio
          solutionId: null, //bq, itinerarios-formativos, p+av, tarefas, ld
          questionType: null, //se for tarefa
          referenceBook: [],
          ftdAssessments: {
            //se for p+ avaliações
            educationSystem: "",
            batches: [],
            questionJustification: "",
            parameterA: "",
            parameterB: "",
            parameterC: "",
            bisserial: "",
            probabilityRanges: [],
          },
        },
        classification: {
          tradicional: tradicional,
          enem: {
            code: enem[0]
          },
          bncc: {
            skillCode: bncc[0]
          },
          formativeTracks: {
            id: itinerarioId,
            tracks: itinerarios
          },
        },
        createdBy: "system",
        lastUpdated: row.ModifiedDate !== "NULL" ? new Date(row.ModifiedDate) : new Date(),
        history: [],
        questionUsed: false,
        anchorQuestion: false,
        relatedProject: {
          id: 0,
          label: ""
        },
        questionCycle: new Date().getFullYear(),
      };

      questions.push(questionData);
      //console.log(classificacao)
      const question = new Question(questionData); //descomentei aqui para subir
      await question.save(); //descomentei aqui para subir
      console.log(`Questão ${row.Id} inserida com sucesso!`);
      sucessQuestions.push({
        id: question._id,
        tipo: question.content.fields[0].format,
        aggregatedId: question.aggregatedId
      })
    } catch (error) {
      console.error(`Erro ao inserir questão ${row.Id}:`, error.message);
      errorQuestions.push({
        numero: row.numero,
        error: error.message,
        data: row,
      });
    }

    if (errorQuestions.length > 0) {
      await saveErrorQuestions(errorQuestions);
    }

    if (sucessQuestions.length > 0) {
      await saveSucessQuestions(sucessQuestions);
    }
  }

  fs.writeFileSync(
    "questions.json",
    JSON.stringify(questions, null, 2),
    "utf8"
  );
  console.log("Arquivo JSON salvo como questions.json");
}

async function main() {
  await connectToMongoDB(); //descomentei aqui para subir  
  await processSpreadsheet();
  mongoose.disconnect(); // descomentei aqui para subir
}

main().catch((error) => console.error("Erro no script principal:", error));
