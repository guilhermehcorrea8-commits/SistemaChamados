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
    priorityFilter: document.getElementById('priorityFilter'),
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
    
    // Adicionar emojis temáticos
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
    
    // Remover após 4 segundos
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

// Função para carregar tickets
const loadTickets = async () => {
    if (isUpdating) return;
    
    try {
        isUpdating = true;
        elements.loadingIndicator.style.display = 'block';
        elements.ticketList.innerHTML = '';

        const status = elements.statusFilter.value;
        const priority = elements.priorityFilter.value;

        const data = await API.getTickets(status, priority);
        tickets = data || [];
        
        // Renderizar lista
        elements.ticketList.innerHTML = Components.renderTicketList(tickets);
        Components.updateTicketCounter(tickets);
        
        // Atualizar estatísticas
        updateStats(tickets);
        
    } catch (error) {
        console.error('Erro ao carregar tickets:', error);
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
        showToast(`👻 Erro ao carregar chamados: ${error.message}`, 'error');
    } finally {
        elements.loadingIndicator.style.display = 'none';
        isUpdating = false;
    }
};

// Atualizar estatísticas
const updateStats = (tickets) => {
    if (!tickets || tickets.length === 0) return;
    
    const stats = {
        total: tickets.length,
        abertos: tickets.filter(t => t.status === 'Aberto').length,
        emAndamento: tickets.filter(t => t.status === 'Em Andamento').length,
        resolvidos: tickets.filter(t => t.status === 'Resolvido').length,
        fechados: tickets.filter(t => t.status === 'Fechado').length,
        urgentes: tickets.filter(t => t.priority === 'Urgente').length
    };
    
    // Atualizar no header
    const statElement = document.querySelector('.stat-item');
    if (statElement) {
        statElement.innerHTML = `
            <i class="fas fa-ticket-alt"></i>
            <span>${stats.total} chamados</span>
            <span style="font-size: 0.8rem; opacity: 0.7; margin-left: 5px;">
                (${stats.urgentes} 🔴 urgentes)
            </span>
        `;
    }
};

// Tornar funções globais para uso no HTML
window.loadTickets = loadTickets;

// Função para criar um novo ticket
const createTicket = async (event) => {
    event.preventDefault();
    
    const formData = new FormData(elements.form);
    const ticketData = {
        title: formData.get('title').trim(),
        description: formData.get('description').trim(),
        priority: formData.get('priority'),
        category: formData.get('category')
    };

    // Validar dados
    if (!ticketData.title) {
        showToast('👻 Por favor, digite um título para o chamado!', 'error');
        elements.form.querySelector('#title').focus();
        return;
    }
    
    if (!ticketData.description) {
        showToast('👻 Por favor, descreva o problema!', 'error');
        elements.form.querySelector('#description').focus();
        return;
    }

    // Mostrar loading no botão
    const submitBtn = elements.form.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
    submitBtn.disabled = true;

    try {
        const newTicket = await API.createTicket(ticketData);
        showToast('👻 Chamado criado com sucesso!', 'success');
        
        // Resetar formulário
        elements.form.reset();
        
        // Recarregar lista
        await loadTickets();
        
    } catch (error) {
        console.error('Erro ao criar chamado:', error);
        showToast(`👻 Erro ao criar chamado: ${error.message}`, 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
};

// Função para atualizar status de um ticket
window.updateStatus = async (id, status) => {
    // Mostrar loading no botão específico
    const ticketElement = document.querySelector(`[data-id="${id}"]`);
    if (ticketElement) {
        const buttons = ticketElement.querySelectorAll('.ticket-actions .btn');
        buttons.forEach(btn => btn.disabled = true);
    }
    
    try {
        await API.updateTicketStatus(id, status);
        showToast(`👻 Status atualizado para "${status}"`, 'success');
        await loadTickets();
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        showToast(`👻 Erro ao atualizar status: ${error.message}`, 'error');
        // Recarregar para garantir consistência
        await loadTickets();
    } finally {
        if (ticketElement) {
            const buttons = ticketElement.querySelectorAll('.ticket-actions .btn');
            buttons.forEach(btn => btn.disabled = false);
        }
    }
};

// Função para deletar um ticket
window.deleteTicket = async (id) => {
    if (!confirm('👻 Tem certeza que deseja excluir este chamado? Esta ação não pode ser desfeita!')) {
        return;
    }

    // Mostrar loading no botão específico
    const ticketElement = document.querySelector(`[data-id="${id}"]`);
    if (ticketElement) {
        ticketElement.style.opacity = '0.5';
    }
    
    try {
        await API.deleteTicket(id);
        showToast('👻 Chamado excluído com sucesso!', 'success');
        await loadTickets();
    } catch (error) {
        console.error('Erro ao excluir chamado:', error);
        showToast(`👻 Erro ao excluir chamado: ${error.message}`, 'error');
        await loadTickets();
    }
};

// Configurar eventos
const setupEventListeners = () => {
    // Formulário de criação
    elements.form.addEventListener('submit', createTicket);

    // Filtros com debounce para melhor performance
    let filterTimeout;
    const handleFilterChange = () => {
        clearTimeout(filterTimeout);
        filterTimeout = setTimeout(loadTickets, 300);
    };
    
    elements.statusFilter.addEventListener('change', handleFilterChange);
    elements.priorityFilter.addEventListener('change', handleFilterChange);

    // Botão de refresh
    elements.refreshBtn.addEventListener('click', () => {
        showToast('👻 Atualizando lista de chamados...', 'info');
        loadTickets();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+R para refresh
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            showToast('👻 Atualizando lista de chamados...', 'info');
            loadTickets();
        }
    });
};

// Inicializar aplicação
const init = () => {
    console.log('👻 Gengar Support System iniciado!');
    setupEventListeners();
    loadTickets();
    
    // Adicionar partículas de fantasma
    createGhostParticles();
};

// Criar partículas de fantasma decorativas
const createGhostParticles = () => {
    const container = document.createElement('div');
    container.className = 'ghost-particles';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        overflow: hidden;
    `;
    document.body.appendChild(container);
    
    const emojis = ['👻', '💜', '✨', '🌟', '💫'];
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 20 + 10}px;
            opacity: ${Math.random() * 0.1 + 0.02};
            animation: floatParticle ${Math.random() * 20 + 15}s infinite linear;
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 15}s;
        `;
        container.appendChild(particle);
    }
    
    // Adicionar keyframes dinamicamente
    const style = document.createElement('style');
    style.textContent = `
        @keyframes floatParticle {
            0% {
                transform: translateY(100vh) rotate(0deg) scale(1);
                opacity: 0;
            }
            10% {
                opacity: 0.15;
            }
            90% {
                opacity: 0.15;
            }
            100% {
                transform: translateY(-100vh) rotate(720deg) scale(0.5);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
};

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);

// Exportar funções para uso global
export {
    loadTickets,
    createTicket,
    updateStatus,
    deleteTicket
};