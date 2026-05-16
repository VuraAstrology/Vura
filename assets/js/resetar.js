// criando função de exibir e escoder senha digitada

const blocoSenha = document.querySelectorAll('.senha');

blocoSenha.forEach(bloco =>{
    const input = bloco.querySelector('input');
    const btnEye = bloco.querySelector('.eye');
    const openEye = bloco.querySelector('.open-eye');
    const closeEye = bloco.querySelector('.close-eye');

    btnEye.addEventListener('click', () =>{
        if (input.type === 'password'){
            openEye.style.display = 'block';
            input.type = 'text';
            closeEye.style.display = 'none';
        }
        else{
            openEye.style.display = 'none';
            closeEye.style.display = 'block';
            input.type = 'password';
        }
    });
});