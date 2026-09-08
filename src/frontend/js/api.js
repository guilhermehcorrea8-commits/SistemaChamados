// Configuração da API
const API_BASE_URL = 'http://localhost:5000/api'; // Ajuste para sua URL

// Função para lidar com erros da API
const handleApiError = (error) => {
    console.error('API Error:', error);
    
    // Verifica se é erro de rede
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('👻 Não foi possível conectar ao servidor. Verifique se a API está rodando!');
    }
    
    // Erro com resposta da API
    if (error.response) {
        throw new Error(error.response.data?.message || 'Erro na requisição');
    }
    
    // Erro de rede ou timeout
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

        // Se a resposta não for ok, tenta extrair a mensagem de erro
        if (!response.ok) {
            let errorMessage = `👻 Erro ${response.status}: ${response.statusText}`;
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.errors) {
                    // Tratamento para erros de validação do .NET
                    const errors = Object.values(errorData.errors).flat();
                    errorMessage = errors.join(', ');
                }
            } catch (e) {
                // Se não conseguir parsear o JSON, usa o status
                errorMessage = `👻 Erro ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        // Se a resposta for 204 No Content, retorna null
        if (response.status === 204) {
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
    // CRUD de Tickets
    getTickets: async (status = null, priority = null) => {
        let endpoint = '/tickets';
        const params = new URLSearchParams();
        if (status && status !== 'all') params.append('status', status);
        if (priority && priority !== 'all') params.append('priority', priority);
        if (params.toString()) endpoint += `?${params.toString()}`;
        return await apiRequest(endpoint);
    },

    getTicketById: async (id) => {
        return await apiRequest(`/tickets/${id}`);
    },

    createTicket: async (ticketData) => {
        return await apiRequest('/tickets', {
            method: 'POST',
            body: JSON.stringify(ticketData)
        });
    },

    updateTicketStatus: async (id, status) => {
        return await apiRequest(`/tickets/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    deleteTicket: async (id) => {
        return await apiRequest(`/tickets/${id}`, {
            method: 'DELETE'
        });
    },

    // Múltiplas operações para compatibilidade
    updateTicket: async (id, ticketData) => {
        return await apiRequest(`/tickets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(ticketData)
        });
    }
};

export default API;