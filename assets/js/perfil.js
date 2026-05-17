/**
 * Vura - Editar Perfil
 * Script: perfil.js
 */

const API_BASE = 'http://localhost:3000';

// ── Usuário logado ──────────────────────────────────────────
function getUsuario() {
    try {
        const raw = localStorage.getItem('vura_usuario') ?? sessionStorage.getItem('vura_usuario');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

function setUsuario(usuario) {
    if (localStorage.getItem('vura_usuario')) {
        localStorage.setItem('vura_usuario', JSON.stringify(usuario));
    } else {
        sessionStorage.setItem('vura_usuario', JSON.stringify(usuario));
    }
}

// ── Preenche o formulário com os dados atuais ───────────────
function preencherFormulario() {
    const usuario = getUsuario();
    if (!usuario) {
        window.location.href = './login.html';
        return;
    }

    document.getElementById('nome').value  = usuario.nome  || '';
    document.getElementById('email').value = usuario.email || '';

    // Exibe inicial no avatar
    const inicial = (usuario.nome || '?')[0].toUpperCase();
    document.querySelector('.avatar-ring').childNodes[0].textContent = inicial;
    document.querySelector('.avatar-name').textContent = usuario.nome || '';
}

// ── Toggle senha visível/oculta ─────────────────────────────
window.togglePass = (btn) => {
    const input = btn.previousElementSibling;
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    btn.innerHTML = isPass
        ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
           </svg>`
        : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
           </svg>`;
};

// ── Salvar alterações ───────────────────────────────────────
window.salvar = async () => {
    const usuario   = getUsuario();
    if (!usuario?.id) { window.location.href = './login.html'; return; }

    const nome         = document.getElementById('nome').value.trim();
    const email        = document.getElementById('email').value.trim();
    const senhaAtual   = document.getElementById('senha-atual').value;
    const novaSenha    = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const elErro       = document.getElementById('perfil-erro');
    const btn          = document.querySelector('.btn-save');

    elErro.textContent = '';

    // Validações básicas
    if (!nome || !email) {
        elErro.textContent = 'Nome e email são obrigatórios.';
        return;
    }

    // Se quer mudar senha, precisa preencher os três campos
    const querMudarSenha = senhaAtual || novaSenha || confirmarSenha;
    if (querMudarSenha) {
        if (!senhaAtual) { elErro.textContent = 'Digite sua senha atual.'; return; }
        if (!novaSenha)  { elErro.textContent = 'Digite a nova senha.'; return; }
        if (novaSenha.length < 6) { elErro.textContent = 'A nova senha deve ter ao menos 6 caracteres.'; return; }
        if (novaSenha !== confirmarSenha) { elErro.textContent = 'As senhas não coincidem.'; return; }
    }

    btn.disabled = true;
    btn.textContent = 'Salvando...';

    try {
        const body = { id: usuario.id, nome, email };
        if (querMudarSenha) {
            body.senha_atual = senhaAtual;
            body.nova_senha  = novaSenha;
        }

        const resp = await fetch(`${API_BASE}/perfil`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const dados = await resp.json();
        if (!resp.ok) throw new Error(dados.erro || 'Erro ao salvar.');

        // Atualiza o storage com os novos dados
        setUsuario({ ...usuario, nome, email });

        // Feedback visual
        btn.textContent = '✓ Salvo!';
        btn.style.background = 'linear-gradient(135deg, #9ef2aa, #004334)';

        // Limpa campos de senha
        document.getElementById('senha-atual').value    = '';
        document.getElementById('nova-senha').value     = '';
        document.getElementById('confirmar-senha').value = '';

        // Atualiza avatar
        document.querySelector('.avatar-ring').childNodes[0].textContent = nome[0].toUpperCase();
        document.querySelector('.avatar-name').textContent = nome;

        setTimeout(() => {
            btn.textContent = 'Salvar alterações';
            btn.style.background = '';
        }, 2000);

    } catch (err) {
        elErro.textContent = err.message;
    } finally {
        btn.disabled = false;
    }
};

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', preencherFormulario);