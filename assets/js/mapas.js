/**
 * Vura - Gerenciamento de Registros Astrológicos
 * Script: mapas.js
 */

// 1. ESTADO DA APLICAÇÃO (Dados iniciais)
let mapas = [
    { id: 1, nome: "nome usuário padrão", isUser: true, selecionado: false }
];

let contador = 2;

/**
 * 2. RENDERIZAÇÃO DA LISTA
 * Desenha os cards dentro da div .todos_registros
 */
function renderizarLista() {
    const todosRegistrosDiv = document.querySelector('.todos_registros');

    if (!todosRegistrosDiv) return; // Segurança caso a div não exista

    todosRegistrosDiv.innerHTML = ''; // Limpa a lista para atualizar

    mapas.forEach((mapa, index) => {
        const itemDiv = document.createElement('div');

        // Adiciona classe de item e destaque se for o principal
        itemDiv.className = `map-item ${mapa.isUser ? 'destaque-usuario' : ''}`;

        itemDiv.innerHTML = `
            <div class="info-group">
                <span class="material-symbols-outlined icon-vura">
                    ${mapa.isUser ? 'stars' : 'account_circle'}
                </span>
                
                ${mapa.isUser ? '<span class="badge-eu">eu *</span>' : ''}
                <span class="name-text">${mapa.nome}</span>
                
                <div class="actions">
                    <button class="btn-outline">visualizar</button>
                    <button class="btn-outline">editar</button>
                </div>
            </div>

            <input type="checkbox" class="check-vura" 
                   ${mapa.selecionado ? 'checked' : ''} 
                   onchange="alternarSelecao(${index})">
        `;

        todosRegistrosDiv.appendChild(itemDiv);
    });
}

/**
 * 3. FUNÇÕES DE CONTROLE (Expostas ao Window para o HTML ler)
 */

// Selecionar/Deselecionar um mapa
window.alternarSelecao = (index) => {
    mapas[index].selecionado = !mapas[index].selecionado;
};

// Adicionar novo mapa à lista
window.adicionar = () => {
    const novoMapa = {
        id: Date.now(),
        nome: `nome pessoa mapa ${contador++}`,
        isUser: false,
        selecionado: false
    };
    mapas.push(novoMapa);
    renderizarLista();
};

// Ir para a tela de confirmação de exclusão
window.irParaEliminar = () => {
    const selecionados = mapas.filter(m => m.selecionado);

    if (selecionados.length === 0) {
        alert("Por favor, selecione ao menos um registro para apagar.");
        return;
    }

    const listaApagarUl = document.getElementById('lista-apagar');
    const sectionGerenciamento = document.getElementById('gerenciamento');
    const sectionApagar = document.getElementById('apagar');

    // Preenche a lista da segunda tela
    listaApagarUl.innerHTML = selecionados
        .map(m => `<li><span class="material-symbols-outlined" style="font-size:14px">close</span> ${m.nome}</li>`)
        .join('');

    // Troca as telas
    sectionGerenciamento.classList.add('escondido');
    sectionApagar.classList.remove('escondido');
};

// Voltar para a tela principal
window.voltar = () => {
    document.getElementById('apagar').classList.add('escondido');
    document.getElementById('gerenciamento').classList.remove('escondido');
};

// Confirmar a exclusão definitiva
window.finalizar = () => {
    // Filtra o array mantendo apenas quem NÃO está selecionado
    mapas = mapas.filter(m => !m.selecionado);

    renderizarLista();
    window.voltar();
};

/**
 * 4. INICIALIZAÇÃO
 * Garante que a lista apareça assim que o site abrir
 */
document.addEventListener('DOMContentLoaded', () => {
    renderizarLista();
});