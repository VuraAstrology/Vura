document.addEventListener('DOMContentLoaded', () => {
  const formulario = document.querySelector('.cadastro-formulario');

  formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('password').value;
    const confirmarSenha = document.getElementById('confirmPassword').value;

    // Validação de senhas
    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    if (senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    const botao = formulario.querySelector('.cadastro-botao');
    botao.disabled = true;
    botao.textContent = 'Criando conta...';

    try {
      const resposta = await fetch('http://localhost:3000/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha }),
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert(dados.mensagem);
        window.location.href = './login.html'; // redireciona para o login
      } else {
        alert(dados.erro || 'Erro ao criar conta.');
      }

    } catch (err) {
      alert('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      console.error(err);
    } finally {
      botao.disabled = false;
      botao.textContent = 'Criar conta';
    }
  });
});