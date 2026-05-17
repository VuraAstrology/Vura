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
      const resposta = await fetch('http://localhost:3000/login', {
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