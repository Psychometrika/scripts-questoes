import { BNCC, Enem, Marista } from '../enitties/questionFTD';
import { makeRequest, setupInterceptors } from '../lib/axios'

interface SaasTokenResponse {
  success: boolean;
  message: string;
  writeSaasToken: {
    token: string;
    expiresOn: string;
  };
  readSaasToken: {
    token: string;
    expiresOn: string;
  };
}

interface LoginResponse {
  accessToken: string;
  isFirstAccess: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    status: boolean;
    permission: string;
    companyName: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
  statusCode: number;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface BnccTreeParams {
  code: string;
}

interface EnemTreeParams {
  knowledgeArea: string;
  code: string;
}

interface MaristaTreeParams {
  code: string;
}

interface GetBnccTreeResponse {
  bncc: BNCC[];
}

interface GetEnemTreeResponse {
  enem: Enem[];
}

interface GetMaristaTreeResponse {
  marista: Marista[];
}

enum EEnemKnowledgeArea {
  'Linguagens e suas Tecnologias' = 1,
  'Linguagens, Códigos e suas Tecnologias' = 1,
  'Matemática e suas Tecnologias' = 2,
  'Ciências da Natureza e suas Tecnologias' = 3,
  'Ciências Humanas e suas Tecnologias' = 4,
}

export class ApiRepository {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await makeRequest<LoginResponse, LoginRequest>({
        method: 'post',
        url: '/auth/login',
        data: {
          email,
          password,
        },
      });

      setupInterceptors(response.data.accessToken);

      console.log('Login successful:', response.data.accessToken);

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async generateQuestionSaasToken(): Promise<SaasTokenResponse> {
    const response = await makeRequest<SaasTokenResponse>({
      method: 'get',
      url: '/questions/saas-token',
    });

    return response.data;
  }

  async getBnccTree({ code }: BnccTreeParams): Promise<GetBnccTreeResponse> {
    try {
      console.log(`getBnccTree: ${code}`, `na rota /tree/bncc/tree-completed/${code}`);
      const response = await makeRequest<GetBnccTreeResponse>({
        method: 'get',
        url: `/tree/bncc/tree-completed/${code}`,
      });

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getEnemTree({ knowledgeArea, code }: EnemTreeParams): Promise<GetEnemTreeResponse> {
    const area = EEnemKnowledgeArea[knowledgeArea as keyof typeof EEnemKnowledgeArea];
    if (!code || !area) {
      throw new Error('Invalid code or knowledgeArea provided');
    }

    const response = await makeRequest<GetEnemTreeResponse>({
      method: 'get',
      url: `/tree/enem/tree-completed/${area}/${code}`,
    });

    return response.data;
  }

  async getMaristaTree({ code }: MaristaTreeParams): Promise<GetMaristaTreeResponse> {
    const response = await makeRequest<GetMaristaTreeResponse>({
      method: 'get',
      url: `/tree/marista/tree-completed/${code}`,
    });

    return response.data;
  }
}
