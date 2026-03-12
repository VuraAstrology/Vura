function togglePass(btn) {
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
}

function salvar() {
const btn = document.querySelector('.btn-save');
btn.textContent = '✓ Salvo!';
btn.style.background = 'linear-gradient(135deg, #9ef2aa, #004334)';
setTimeout(() => {
    btn.textContent = 'Salvar alterações';
    btn.style.background = '';
}, 2000);
}