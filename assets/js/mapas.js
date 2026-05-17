/**
 * Vura - Gerenciamento de Registros Astrológicos
 * Script: mapas.js
 */

const API_BASE = 'http://localhost:3000';

// ── Usuário logado ──────────────────────────────────────────
function getUsuario() {
    try {
        const raw = localStorage.getItem('vura_usuario') ?? sessionStorage.getItem('vura_usuario');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

// ── Estado local ────────────────────────────────────────────
let mapas = [];
let selecionados = new Set(); // ids selecionados para deletar

// ── Carregar mapas do banco ─────────────────────────────────
async function carregarMapas() {
    const usuario = getUsuario();
    if (!usuario?.id) {
        mostrarErro('Você precisa estar logado para ver seus mapas.');
        return;
    }

    try {
        const resp = await fetch(`${API_BASE}/api/mapas?usuario_id=${usuario.id}`);
        const dados = await resp.json();
        if (!resp.ok) throw new Error(dados.error || 'Erro ao carregar mapas.');
        mapas = dados.mapas || [];
        renderizarLista();
    } catch (err) {
        mostrarErro(err.message);
    }
}

// ── Renderizar lista de cards ───────────────────────────────
function renderizarLista() {
    const container = document.querySelector('.todos_registros');
    if (!container) return;

    if (mapas.length === 0) {
        container.innerHTML = '<p class="sem-mapas">Nenhum mapa cadastrado ainda.</p>';
        return;
    }

    container.innerHTML = '';

    mapas.forEach((mapa, index) => {
        const isPrimeiro = index === 0;
        const dataNasc   = mapa.data_nasc ? mapa.data_nasc.split('T')[0] : '';
        const apelido    = mapa.apelido || mapa.nome;

        const itemDiv = document.createElement('div');
        itemDiv.className = `map-item ${isPrimeiro ? 'destaque-usuario' : ''}`;
        itemDiv.dataset.id = mapa.id;

        itemDiv.innerHTML = `
            <div class="info-group">
                <span class="material-symbols-outlined icon-vura">
                    ${isPrimeiro ? 'stars' : 'account_circle'}
                </span>
                ${isPrimeiro ? '<span class="badge-eu">eu *</span>' : ''}
                <div class="map-info">
                    <span class="name-text">${apelido}</span>
                    <span class="map-detalhe">${mapa.nome} · ${dataNasc} · ${mapa.cidade}</span>
                </div>
                <div class="actions">
                    <button class="btn-outline" onclick="visualizar(${mapa.id})">visualizar</button>
                    <button class="btn-outline" onclick="abrirEdicao(${mapa.id})">editar</button>
                </div>
            </div>
            <input type="checkbox" class="check-vura"
                   onchange="alternarSelecao(${mapa.id}, this.checked)">
        `;

        container.appendChild(itemDiv);
    });
}

// ── Selecionar / deselecionar ───────────────────────────────
window.alternarSelecao = (id, checked) => {
    checked ? selecionados.add(id) : selecionados.delete(id);
};

// ── Visualizar — redireciona para mandala.html com id ───────
window.visualizar = (id) => {
    window.location.href = `./mandala.html?mapaId=${id}`;
};

// ── Adicionar — redireciona para mandala.html limpo ─────────
window.adicionar = () => {
    window.location.href = './mandala.html';
};

// ════════════════════════════════════════════════════════════
// EDIÇÃO — redireciona para mandala.html com dados pré-preenchidos
// ════════════════════════════════════════════════════════════
window.abrirEdicao = async (id) => {
    try {
        const resp = await fetch(`${API_BASE}/api/mapas?id=${id}`);
        const mapa = await resp.json();
        if (!resp.ok) throw new Error(mapa.error);

        // Salva os dados no sessionStorage para o mandala.html ler
        sessionStorage.setItem('vura_edicao', JSON.stringify({
            mapaId:   mapa.id,
            apelido:  mapa.apelido  || '',
            nome:     mapa.nome     || '',
            data:     mapa.data_nasc ? mapa.data_nasc.split('T')[0] : '',
            hora:     mapa.hora_nasc ? mapa.hora_nasc.substring(0, 5) : '',
            cidade:   mapa.cidade   || '',
            lat:      mapa.lat      || '',
            lng:      mapa.lng      || '',
            tz_str:   mapa.tz_str   || '',
        }));

        window.location.href = './mandala.html?editar=1';
    } catch (err) {
        alert('Erro ao carregar dados para edição: ' + err.message);
    }
};

// ════════════════════════════════════════════════════════════
// EXCLUSÃO
// ════════════════════════════════════════════════════════════
window.irParaEliminar = () => {
    if (selecionados.size === 0) {
        alert('Selecione ao menos um registro para apagar.');
        return;
    }

    const listaUl = document.getElementById('lista-apagar');
    listaUl.innerHTML = mapas
        .filter(m => selecionados.has(m.id))
        .map(m => `<li><span class="material-symbols-outlined" style="font-size:14px">close</span> ${m.apelido || m.nome}</li>`)
        .join('');

    document.getElementById('gerenciamento').classList.add('escondido');
    document.getElementById('apagar').classList.remove('escondido');
};

window.voltar = () => {
    document.getElementById('apagar').classList.add('escondido');
    document.getElementById('gerenciamento').classList.remove('escondido');
};

window.finalizar = async () => {
    const usuario = getUsuario();
    if (!usuario?.id) return;

    const senha = document.getElementById('senha_vura').value;
    if (!senha) { alert('Digite sua senha para confirmar.'); return; }

    // Confirma senha no backend
    try {
        const respLogin = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: usuario.email, senha }),
        });
        if (!respLogin.ok) { alert('Senha incorreta.'); return; }
    } catch {
        alert('Erro ao verificar senha.');
        return;
    }

    // Deleta todos os selecionados
    const promessas = [...selecionados].map(id =>
        fetch(`${API_BASE}/api/mapas?id=${id}&usuario_id=${usuario.id}`, { method: 'DELETE' })
    );

    await Promise.all(promessas);
    selecionados.clear();
    document.getElementById('senha_vura').value = '';
    window.voltar();
    await carregarMapas();
};

// ════════════════════════════════════════════════════════════
// MODAL HELPERS
// ════════════════════════════════════════════════════════════
function abrirModal(id) {
    document.getElementById(id).classList.remove('escondido');
    document.getElementById(id).classList.add('modal-visivel');
}
function fecharModal(id) {
    document.getElementById(id).classList.add('escondido');
    document.getElementById(id).classList.remove('modal-visivel');
}
window.fecharModal = fecharModal;

// ── Helpers de erro ─────────────────────────────────────────
function mostrarErro(msg) {
    const container = document.querySelector('.todos_registros');
    if (container) container.innerHTML = `<p class="sem-mapas erro">${msg}</p>`;
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    carregarMapas();
});