// Configuração da API
const API_BASE_URL = 'http://localhost:5296/api';

// Função para lidar com erros da API
const handleApiError = (error) => {
    console.error('API Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('👻 Não foi possível conectar ao servidor. Verifique se a API está rodando!');
    }
    
    if (error.response) {
        throw new Error(error.response.data?.message || 'Erro na requisição');
    }
    
    if (error.message) {
        throw new Error(error.message || 'Erro de conexão com o servidor');
    }
    
    throw new Error('👻 Erro desconhecido ao processar a requisição');
};

// Função para fazer requisições HTTP
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    };

    try {
        const response = await fetch(url, {
            ...defaultOptions,
            ...options
        });

        if (!response.ok) {
            let errorMessage = `👻 Erro ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.title) {
                    errorMessage = errorData.title;
                } else if (errorData.errors) {
                    const errors = Object.values(errorData.errors).flat();
                    errorMessage = errors.join(', ');
                }
            } catch (e) {
                errorMessage = `👻 Erro ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        throw handleApiError(error);
    }
};

// Funções específicas da API
const API = {
    // Listar chamados (com filtro opcional de status)
    getTickets: async (status = null) => {
        let endpoint = '/chamados';

        if (status && status !== 'all') {
            endpoint += `?status=${encodeURIComponent(status)}`;
        }

        return await apiRequest(endpoint);
    },

    // Buscar chamado por ID
    getTicketById: async (id) => {
        return await apiRequest(`/chamados/${id}`);
    },

    // Criar novo chamado
    createTicket: async (ticketData) => {
        return await apiRequest('/chamados', {
            method: 'POST',
            body: JSON.stringify(ticketData)
        });
    },

    // Atualizar status do chamado
    updateTicketStatus: async (id, status) => {
        return await apiRequest(`/chamados/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    // Excluir chamado
    deleteTicket: async (id) => {
        return await apiRequest(`/chamados/${id}`, {
            method: 'DELETE'
        });
    }
};

export default API;