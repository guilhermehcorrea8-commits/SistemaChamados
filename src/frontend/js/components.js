// Função para criar os elementos do DOM
const Components = {
    // Criar o HTML de um chamado individual
    renderTicket: (ticket) => {
        const statusMap = {
            'Pendente': 'status-pendente',
            'Em Andamento': 'status-em-andamento',
            'Resolvido': 'status-resolvido'
        };

        // Formatar data (aceita tanto createdAt quanto dataAbertura)
        const rawDate = ticket.createdAt || ticket.dataAbertura || new Date().toISOString();
        const createdDate = new Date(rawDate);
        const formattedDate = createdDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="ticket-item" data-id="${ticket.id}">
                <div class="ticket-header">
                    <h3 class="ticket-title">${Components.escapeHtml(ticket.titulo)}</h3>
                    <div class="ticket-meta">
                        <span class="status-badge ${statusMap[ticket.status] || 'status-pendente'}">
                            ${ticket.status || 'Pendente'}
                        </span>
                    </div>
                </div>
                
                <p class="ticket-description">${Components.escapeHtml(ticket.descricao)}</p>
                
                <div class="ticket-footer">
                    <div class="ticket-info">
                        <span><i class="fas fa-tag"></i> ${ticket.categoria || 'Outro'}</span>
                        <span><i class="fas fa-user"></i> ${Components.escapeHtml(ticket.solicitante || 'Não informado')}</span>
                        <span><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                        <span><i class="fas fa-ghost"></i> #${ticket.id}</span>
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
            'Pendente': [
                { status: 'Em Andamento', label: 'Iniciar', icon: 'fa-play', class: 'btn-success' }
            ],
            'Em Andamento': [
                { status: 'Resolvido', label: 'Resolver', icon: 'fa-check', class: 'btn-success' },
                { status: 'Pendente', label: 'Reabrir', icon: 'fa-undo', class: 'btn-warning' }
            ],
            'Resolvido': [
                { status: 'Em Andamento', label: 'Reabrir', icon: 'fa-undo', class: 'btn-warning' }
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

    // Renderizar lista completa de chamados
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
        return String(unsafe)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    },

    // Atualizar contador de chamados
    updateTicketCounter: (tickets) => {
        const total = document.getElementById('totalTickets');
        if (total) {
            total.textContent = tickets ? tickets.length : 0;
        }
    }
};

export default Components;