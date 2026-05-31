document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.querySelector('.login-formulario');

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value;
    const lembrar = document.querySelector('input[name="remember"]').checked;

    const botao = formulario.querySelector('.login-botao');
    botao.disabled = true;
    botao.textContent = 'Entrando...';

    try {
      const resposta = await fetch('https://vura-w5sy.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        // Salva os dados do usuário no storage conforme a opção "lembrar de mim"
        const storage = lembrar ? localStorage : sessionStorage;
        storage.setItem('vura_usuario', JSON.stringify(dados.usuario));

        alert(dados.mensagem);
        window.location.href = './mandala.html'; // redireciona para a home
      } else {
        alert(dados.erro || 'Erro ao fazer login.');
      }

    } catch (err) {
      alert('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      console.error(err);
    } finally {
      botao.disabled = false;
      botao.textContent = 'Entrar';
    }
  });
  
});

window.togglePass = (btn) => {
  const input  = btn.closest('.input-wrap').querySelector('input');
  const visivel = input.type === 'text';

  input.type = visivel ? 'password' : 'text';

  btn.innerHTML = visivel
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