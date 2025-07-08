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

  async getBnccTree({ code }: BnccTreeParams) {
    const response = await makeRequest({
      method: 'get',
      url: `/tree/bncc/tree-completed/${code}`,
    });

    return response.data;
  }

  async getEnemTree({ knowledgeArea, code }: EnemTreeParams) {
    const response = await makeRequest({
      method: 'get',
      url: `/tree/enem/tree-completed/${knowledgeArea}/${code}`,
    });

    return response.data;
  }

  async getMaristaTree({ code }: MaristaTreeParams) {
    const response = await makeRequest({
      method: 'get',
      url: `/tree/marista/tree-completed/${code}`,
    });

    return response.data;
  }
}
