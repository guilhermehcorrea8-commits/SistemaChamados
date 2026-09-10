import API from './api.js';
import Components from './components.js';

// Estado da aplicação
let tickets = [];
let isUpdating = false;

// Elementos DOM
const elements = {
    form: document.getElementById('ticketForm'),
    ticketList: document.getElementById('ticketList'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    statusFilter: document.getElementById('statusFilter'),
    refreshBtn: document.getElementById('refreshBtn')
};

// Função para mostrar toast notifications
const showToast = (message, type = 'info') => {
    const container = document.getElementById('toastContainer') || createToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };
    
    const emojis = {
        success: '👻',
        error: '😱',
        info: '👻'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${emojis[type] || '👻'} ${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
};

// Criar container para toasts
const createToastContainer = () => {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
};

// Função para carregar chamados
const loadTickets = async () => {
    if (isUpdating) return;
    
    try {
        isUpdating = true;
        elements.loadingIndicator.style.display = 'block';
        elements.ticketList.innerHTML = '';

        const status = elements.statusFilter.value;

        const data = await API.getTickets(status);
        tickets = data || [];
        
        elements.ticketList.innerHTML = Components.renderTicketList(tickets);
        Components.updateTicketCounter(tickets);
        
    } catch (error) {
        console.error('Erro ao carregar chamados:', error);
        elements.ticketList.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>😱 Erro ao carregar chamados</h3>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="window.loadTickets()" style="margin-top: 15px;">
                    <i class="fas fa-sync"></i> Tentar novamente
                </button>
            </div>
        `;
        showToast(`Erro ao carregar chamados: ${error.message}`, 'error');
    } finally {
        elements.loadingIndicator.style.display = 'none';
        isUpdating = false;
    }
};

// Tornar loadTickets global
window.loadTickets = loadTickets;

// Função para criar um novo chamado
const createTicket = async (event) => {
    event.preventDefault();
    
    const ticketData = {
        titulo: document.getElementById('title').value.trim(),
        descricao: document.getElementById('description').value.trim(),
        categoria: document.getElementById('category').value,
        solicitante: document.getElementById('solicitante').value.trim()
    };

    // Validações
    if (!ticketData.titulo) {
        showToast('Por favor, digite um título para o chamado!', 'error');
        document.getElementById('title').focus();
        return;
    }
    
    if (!ticketData.descricao) {
        showToast('Por favor, descreva o problema!', 'error');
        document.getElementById('description').focus();
        return;
    }
    
    if (!ticketData.solicitante) {
        showToast('Por favor, informe o solicitante!', 'error');
        document.getElementById('solicitante').focus();
        return;
    }

    const submitBtn = elements.form.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
    submitBtn.disabled = true;

    try {
        await API.createTicket(ticketData);
        showToast('Chamado criado com sucesso!', 'success');
        
        elements.form.reset();
        await loadTickets();
        
    } catch (error) {
        console.error('Erro ao criar chamado:', error);
        showToast(`Erro ao criar chamado: ${error.message}`, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
};

// Função para atualizar status (global para uso no onclick)
window.updateStatus = async (id, status) => {
    const ticketElement = document.querySelector(`[data-id="${id}"]`);
    if (ticketElement) {
        const buttons = ticketElement.querySelectorAll('.ticket-actions .btn');
        buttons.forEach(btn => btn.disabled = true);
    }
    
    try {
        await API.updateTicketStatus(id, status);
        showToast(`Status atualizado para "${status}"`, 'success');
        await loadTickets();
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showToast(`Erro ao atualizar status: ${error.message}`, 'error');
        await loadTickets();
    }
};

// Função para deletar chamado (global para uso no onclick)
window.deleteTicket = async (id) => {
    if (!confirm('👻 Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita!')) {
        return;
    }

    const ticketElement = document.querySelector(`[data-id="${id}"]`);
    if (ticketElement) {
        ticketElement.style.opacity = '0.5';
    }
    
    try {
        await API.deleteTicket(id);
        showToast('Chamado excluído com sucesso!', 'success');
        await loadTickets();
    } catch (error) {
        console.error('Erro ao excluir chamado:', error);
        showToast(`Erro ao excluir chamado: ${error.message}`, 'error');
        await loadTickets();
    }
};

// Configurar eventos
const setupEventListeners = () => {
    elements.form.addEventListener('submit', createTicket);

    let filterTimeout;
    elements.statusFilter.addEventListener('change', () => {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(loadTickets, 200);
    });

    elements.refreshBtn.addEventListener('click', () => {
        showToast('Atualizando lista de chamados...', 'info');
        loadTickets();
    });
};

// Inicializar aplicação
const init = () => {
    console.log('👻 Gengar Support System iniciado!');
    console.log('📡 API:', 'http://localhost:5296/api');
    setupEventListeners();
    loadTickets();
};

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

export {
    loadTickets,
    createTicket
};