// criando função de exibir e escoder senha digitada

const blocoSenha = document.querySelectorAll('.senha');

console.log('js, rodando ... funcionou!')

blocoSenha.forEach(bloco =>{
    const input = bloco.querySelector('input');
    const btnEye = bloco.querySelector('.eye');
    const openEye = bloco.querySelector('.open-eye');
    const closeEye = bloco.querySelector('.close-eye');

    btnEye.addEventListener('click', () =>{
        if (input.type === 'password'){
            input.type = 'text';
            openEye.style.display = 'block';
            closeEye.style.display = 'none';
        }
        else{
            input.type = 'password';
            openEye.style.display = 'none';
            closeEye.style.display ='block';
        }
    });
});

// fazendo a verificação das credências

const params = new URLSearchParams(window.location.search);
const token = params.get('token');

console.log(token);

document.getElementById('formulario_confirmar_senha').addEventListener('submit', async(e) =>{
    e.preventDefault();
    const novaSenha = document.getElementById('password').value;
    const confirmarSenha = document.getElementById('confirmpassword').value;


    // comparando as senhas___________________________________________________

    if (confirmarSenha !== novaSenha){
        alert('Senhas diferentes, porfavor verifique as senhas');
        console.log('ERRO, Senhas diferentes!');
        return;
    }
    
    if (novaSenha.length < 6){
        
        let faltando = 6 - (novaSenha.length);
        alert(`Senha muito pequena faltando ${faltando},caracteres no mínimo`);
        console.log('ERRO, Senha muito pequena');
        return;

    }

   try {
    const resposta = await fetch('https://vura-w5sy.onrender.com/resetar',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token,
                novaSenha
            })
        }
    );
    const dados = await resposta.json();

    if (resposta.ok) {
        alert(dados.mensagem || 'Senha alterada com sucesso!');
        window.location.href = 'https://vuraastrology.github.io/Vura/login.html';
    } else {
        alert(dados.erro || 'Erro ao alterar a senha.');
    }

} catch (erro) {
    console.log(erro);
    alert('Erro, impossível conectar com o servidor no momento, por favor tente mais tarde');
}
});