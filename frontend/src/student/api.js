import api from '../common/services/api';
export async function apiRequest(endpoint, options = {}) { const {body,...config}=options; const response=await api.request({url:endpoint,...config,...(body?{data:typeof body==='string'?JSON.parse(body):body}:{})});return response.data;}
