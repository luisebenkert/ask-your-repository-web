import api from '../config/api';

class EvaluationService {
  static async post(data) {
    console.log(data);
    const evaluationSet = JSON.stringify(data);
    console.log(evaluationSet);
    await api.post('/evaluation', { evaluationSet });
  }
}

export default EvaluationService;
