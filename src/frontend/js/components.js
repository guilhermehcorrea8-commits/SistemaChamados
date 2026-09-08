// Função para criar os elementos do DOM
const Components = {
    // Criar o HTML de um ticket individual
    renderTicket: (ticket) => {
        const statusMap = {
            'Aberto': 'status-aberto',
            'Em Andamento': 'status-em-andamento',
            'Resolvido': 'status-resolvido',
            'Fechado': 'status-fechado'
        };

        const priorityMap = {
            'Baixa': 'priority-baixa',
            'Média': 'priority-média',
            'Alta': 'priority-alta',
            'Urgente': 'priority-urgente'
        };

        // Formatar data
        const createdDate = new Date(ticket.createdAt);
        const formattedDate = createdDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Adicionar emoji baseado na prioridade
        const priorityEmojis = {
            'Baixa': '🟢',
            'Média': '🟡',
            'Alta': '🟠',
            'Urgente': '🔴'
        };

        return `
            <div class="ticket-item" data-id="${ticket.id}">
                <div class="ticket-header">
                    <h3 class="ticket-title">${Components.escapeHtml(ticket.title)}</h3>
                    <div class="ticket-meta">
                        <span class="status-badge ${statusMap[ticket.status] || 'status-aberto'}">
                            ${ticket.status || 'Aberto'}
                        </span>
                        <span class="priority-badge ${priorityMap[ticket.priority] || 'priority-média'}">
                            ${priorityEmojis[ticket.priority] || '🟡'} ${ticket.priority || 'Média'}
                        </span>
                    </div>
                </div>
                
                <p class="ticket-description">${Components.escapeHtml(ticket.description)}</p>
                
                <div class="ticket-footer">
                    <div class="ticket-info">
                        <span><i class="fas fa-tag"></i> ${ticket.category || 'Sem categoria'}</span>
                        <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                        <span><i class="fas fa-ghost"></i> ID: #${ticket.id}</span>
                    </div>
                    <div class="ticket-actions">
                        ${Components.getStatusActions(ticket.id, ticket.status)}
                        <button class="btn btn-danger" onclick="window.deleteTicket('${ticket.id}')">
                            <i class="fas fa-trash"></i> Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // Gerar botões de ação baseados no status atual
    getStatusActions: (id, currentStatus) => {
        const statusTransitions = {
            'Aberto': [
                { status: 'Em Andamento', label: 'Iniciar', icon: 'fa-play', class: 'btn-success' }
            ],
            'Em Andamento': [
                { status: 'Resolvido', label: 'Resolver', icon: 'fa-check', class: 'btn-success' },
                { status: 'Aberto', label: 'Reabrir', icon: 'fa-undo', class: 'btn-warning' }
            ],
            'Resolvido': [
                { status: 'Fechado', label: 'Fechar', icon: 'fa-times', class: 'btn-danger' },
                { status: 'Em Andamento', label: 'Reabrir', icon: 'fa-undo', class: 'btn-warning' }
            ],
            'Fechado': [
                { status: 'Aberto', label: 'Reabrir', icon: 'fa-undo', class: 'btn-warning' }
            ]
        };

        const actions = statusTransitions[currentStatus] || [];
        return actions.map(action => `
            <button class="btn ${action.class}" 
                    onclick="window.updateStatus('${id}', '${action.status}')">
                <i class="fas ${action.icon}"></i> ${action.label}
            </button>
        `).join('');
    },

    // Renderizar lista completa de tickets
    renderTicketList: (tickets) => {
        if (!tickets || tickets.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-ghost"></i>
                    <h3>👻 Nenhum chamado encontrado</h3>
                    <p>Crie seu primeiro chamado no formulário ao lado!</p>
                    <p style="margin-top: 10px; font-size: 0.9rem; opacity: 0.6;">
                        <i class="fas fa-plus-circle"></i> Clique em "Criar Chamado" para começar
                    </p>
                </div>
            `;
        }

        return tickets.map(ticket => Components.renderTicket(ticket)).join('');
    },

    // Escapar HTML para prevenir XSS
    escapeHtml: (unsafe) => {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    // Atualizar contador de tickets
    updateTicketCounter: (tickets) => {
        const counter = document.getElementById('ticketCount');
        const total = document.getElementById('totalTickets');
        if (counter) {
            const count = tickets ? tickets.length : 0;
            counter.textContent = `${count} chamado${count !== 1 ? 's' : ''}`;
        }
        if (total) {
            total.textContent = tickets ? tickets.length : 0;
        }
    }
};

export default Components;