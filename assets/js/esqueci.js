const formulario = document.getElementById('formulario_nova_senha');
formulario.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const botaoEnviar = document.getElementById('enviar');
    botaoEnviar.disabled = true;
    botaoEnviar.textContent = 'Enviando...';

    try{
        const resposta = await fetch('https://localhost:3000/esqueci-senha',
            {
                method:'POST',
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({email})
            }
        );
        const dados = await resposta.json();
        alert(dados.mensagem || dados.erro);
    }
    catch(err){
        console.log('ERRO');
        alert('Ocorreu um erro, foi ímposível conectar com o Servidor no Momento!! Por favor tente mais tarde!');
    } finally{
        botaoEnviar.disabled = false;
        botaoEnviar.textContent = 'Enviar';
    }
});