document.addEventListener("DOMContentLoaded", () => {
    const footerHTML = `
        <footer>
            <div class="social_redes">
                <a href="#" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                <a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
                <a href="#" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
            </div>
            <p>Vura &copy; 2026</p>
            <div class="footer_contents">
                <a href="#">Home</a>
                <a href="#">Sobre</a>
                <a href="#">Termos de Uso</a>
<<<<<<< HEAD
                <a href="./politica_privacidade.html">Política de Privacidade</a>
                <a href="./termos_uso.html">Fale Conosco</a>
=======
                <a href="politica_privacidade.html">Política de Privacidade</a>
                <a href="#">Fale Conosco</a>
>>>>>>> 6229715ea03aaa3efb8f5bd4536075d465cc51ed
            </div>
        </footer>
    `;

    document.getElementById("footer-container").innerHTML = footerHTML;
});