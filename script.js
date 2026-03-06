function mostrarSigno() {
    // 1. Pegar o valor selecionado no select
    var signoSelecionado = document.getElementById("selectSigno").value;

    // 2. Esconder todos os conteúdos primeiro
    var todosOsSignos = document.querySelectorAll('.signo-conteudo');
    todosOsSignos.forEach(function(el) {
        el.style.display = 'none';
    });

    // 3. Mostrar apenas o signo que foi selecionado
    if (signoSelecionado !== "") {
        document.getElementById(signoSelecionado).style.display = 'block';
    }
}