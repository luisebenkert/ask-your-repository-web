import humps from 'humps';
import api from '../config/api';

class EvaluationService {
  static async post(data) {
    const evaluationSet = JSON.stringify(data);
    await api.post('/evaluation', { evaluationSet });
  }

  static async get(data) {
    const response = await api.get('/images', {
      params: humps.decamelizeKeys(data),
    });
    const result = humps.camelizeKeys(response.data);
    return result;
  }
}

export default EvaluationService;
