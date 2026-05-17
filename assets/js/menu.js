/* ══════════════════════════════════════════════
    VURA NAV — nav.js
    Injeta o menu em qualquer página via:
    <div id="vura-nav"></div>
    <script src="./assets/js/nav.js"></script>
    ══════════════════════════════════════════════ */

    (function () {
        'use strict';

        /* ── 0. Estado de autenticação ──
         * Compatível com login.js:
         *   - Chave: 'vura_usuario'
         *   - "Lembrar de mim" marcado  → salvo em localStorage
         *   - "Lembrar de mim" desmarcado → salvo em sessionStorage
         * O nav verifica os dois e prioriza o localStorage.
         */
        function getUser() {
            try {
                const raw = localStorage.getItem('vura_usuario')
                         ?? sessionStorage.getItem('vura_usuario');
                return raw ? JSON.parse(raw) : null;
            } catch {
                return null;
            }
        }

        /* ── 1. HTML do dropdown de perfil — varia conforme login ── */
        function buildProfileDropdown(user) {
            if (user) {
                /* ── LOGADO ── */
                return `
                    <ul class="nav-profile-dropdown">
                        <li class="user-header">
                            <p>Meu Vura</p>
                            <span>Olá, ${user.nome || 'Bem-vindo(a)'}!</span>
                        </li>
                        <li><a href="./mandala.html"><i class="fa-solid fa-circle-nodes"></i> Mapa Natal</a></li>
                        <li><a href="#"><i class="fa-solid fa-bookmark"></i> Salvos</a></li>
                        <li><a href="./mapas.html"><i class="fa-solid fa-database"></i> Dados Armazenados</a></li>
                        <li><a href="./perfil.html"><i class="fa-solid fa-gear"></i> Gerenciamento da Conta</a></li>
                        <li><a href="#"><i class="fa-solid fa-circle-question"></i> Central de Ajuda</a></li>
                        <hr class="nav-divisor">
                        <li><a href="#" id="vura-logout-btn"><i class="fa-solid fa-right-from-bracket"></i> Sair</a></li>
                    </ul>`;
            } else {
                /* ── DESLOGADO ── */
                return `
                    <ul class="nav-profile-dropdown">
                        <li class="user-header">
                            <p>Meu Vura</p>
                            <span>Bem-vindo(a)!</span>
                        </li>
                        <li><a href="./login.html"><i class="fa-solid fa-right-to-bracket"></i> Entrar</a></li>
                        <li><a href="./cadastro.html"><i class="fa-solid fa-user-plus"></i> Criar Conta</a></li>
                        <hr class="nav-divisor">
                        <li><a href="#"><i class="fa-solid fa-circle-question"></i> Central de Ajuda</a></li>
                    </ul>`;
            }
        }

        /* ── 2. HTML completo do menu ── */
        function buildNav() {
            const user = getUser();
            return `
        <header>
            <nav class="vura-nav">
                <div class="nav-inner">

                    <!-- Logo -->
                    <figure>
                        <a href="./index.html">
                            <img class="vura_logo" src="./assets/imagens/logo_transparent.png" alt="Vura">
                        </a>
                    </figure>

                    <!-- Temas -->
                    <button class="opcao-pill" onclick="abrirPainelTemas()">
                        <span id="theme-dot" style="width:8px;height:8px;border-radius:50%;background:var(--teal-light);display:inline-block;"></span>
                        <span id="theme-label">Noite</span>
                    </button>

                    <!-- Menu principal -->
                    <ul class="nav-menu">

                        <li><a href="./index.html">Signos</a></li>

                        <li>
                            <a href="#">Casas Astrológicas <i class="fa-solid fa-chevron-down"></i></a>
                            <ul class="nav-submenu">
                                <li><a href="./casasAstrologicas.html?casa=casa1">Casa 1</a></li>
                                <li><a href="./casasAstrologicas.html?casa=casa2">Casa 2</a></li>
                                <li><a href="./casasAstrologicas.html?casa=casa3">Casa 3</a></li>
                                <li><a href="./casasAstrologicas.html?casa=casa4">Casa 4</a></li>
                                <li><a href="./casasAstrologicas.html?casa=casa5">Casa 5</a></li>
                                <li><a href="./casasAstrologicas.html?casa=casa6">Casa 6</a></li>
                                <li><a href="./casasAstrologicas.html?casa=casa7">Casa 7</a></li>
                                <li><a href="./casasAstrologicas.html?casa=casa8">Casa 8</a></li>
                                <li><a href="./casasAstrologicas.html?casa=casa9">Casa 9</a></li>
                                <li><a href="./casasAstrologicas.html?casa=casa10">Casa 10</a></li>
                                <li><a href="./casasAstrologicas.html?casa=casa11">Casa 11</a></li>
                                <li><a href="./casasAstrologicas.html?casa=casa12">Casa 12</a></li>
                            </ul>
                        </li>

                        <li>
                            <a href="#">Astros e Posicionamentos <i class="fa-solid fa-chevron-down"></i></a>
                            <ul class="nav-submenu">
                                <li><a href="./posicionamentos.html?astro=sol">Sol ⊙</a></li>
                                <li><a href="./posicionamentos.html?astro=lua">Lua ☾</a></li>
                                <li><a href="./posicionamentos.html?astro=mercurio">Mercúrio ☿</a></li>
                                <li><a href="./posicionamentos.html?astro=venus">Vênus ♀</a></li>
                                <li><a href="./posicionamentos.html?astro=marte">Marte ♂</a></li>
                                <li><a href="./posicionamentos.html?astro=jupiter">Júpiter ♃</a></li>
                                <li><a href="./posicionamentos.html?astro=saturno">Saturno ♄</a></li>
                                <li><a href="./posicionamentos.html?astro=urano">Urano ♅</a></li>
                                <li><a href="./posicionamentos.html?astro=netuno">Netuno ♆</a></li>
                                <li><a href="./posicionamentos.html?astro=plutao">Plutão ♇</a></li>
                                <li><a href="./posicionamentos.html?astro=quiron">Quíron ⚷</a></li>
                                <li><a href="./posicionamentos.html?astro=lilith">Lilith ⚸</a></li>
                                <li><a href="./posicionamentos.html?astro=meioDoCeu">Meio do Céu MC</a></li>
                                <li><a href="./posicionamentos.html?astro=ascendente">Ascendente</a></li>
                            </ul>
                        </li>

                        <!-- Conta / Perfil -->
                        <li class="nav-profile">
                            <button class="nav-profile-btn" aria-expanded="false" aria-haspopup="true">
                                <span class="nav-profile-icon"><i class="fa-solid fa-user"></i></span>
                                <span class="nav-profile-label">${user ? (user.nome || 'Perfil') : 'Conta'}</span>
                                <i class="fa-solid fa-chevron-down"></i>
                            </button>
                            ${buildProfileDropdown(user)}
                        </li>

                    </ul>

                    <!-- Hambúrguer mobile -->
                    <button class="nav-mobile-toggle" aria-label="Abrir menu" aria-expanded="false">
                        <i class="fa-solid fa-bars"></i>
                    </button>

                </div>
            </nav>
            <div id="theme-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:3; align-items:center; justify-content:center;">
                <div id="theme-panel">
                    <div class="theme-panel-header">
                        <span class="theme-panel-titulo">Escolha o tema</span>
                        <button class="theme-panel-fechar" onclick="fecharPainelTemas()">✕</button>
                    </div>
                    <div class="theme-panel-grid" id="theme-grid"></div>
                    <button class="theme-panel-aplicar" onclick="aplicarTema()">Aplicar tema</button>
                </div>
            </div>
        </header>`;
        }

        /* ── 3. Injeta o menu no #vura-nav (ou no início do body como fallback) ── */
        function injectNav() {
            const NAV_HTML = buildNav();
            const mount = document.getElementById('vura-nav');
            if (mount) {
                mount.outerHTML = NAV_HTML;
            } else {
                document.body.insertAdjacentHTML('afterbegin', NAV_HTML);
            }
        }

        /* ── 4. Marca o item ativo de acordo com a URL atual ── */
        function markActive() {
            const path = window.location.pathname.split('/').pop() || 'index.html';
            document.querySelectorAll('.nav-menu a').forEach(a => {
                const href = a.getAttribute('href') || '';
                if (href && href !== '#' && path === href.split('?')[0].split('/').pop()) {
                    a.classList.add('nav-active');
                    const parentLi = a.closest('ul.nav-submenu')?.closest('li');
                    if (parentLi) parentLi.querySelector(':scope > a')?.classList.add('nav-active');
                }
            });
        }

        /* ── 5. Logout ── */
        function initLogout() {
            const logoutBtn = document.getElementById('vura-logout-btn');
            if (!logoutBtn) return;
            logoutBtn.addEventListener('click', e => {
                e.preventDefault();
                localStorage.removeItem('vura_usuario');
                sessionStorage.removeItem('vura_usuario');
                window.location.href = './index.html';
            });
        }

        /* ── 6. Lógica de interação (hambúrguer, submenus, perfil) ── */
        function initInteractions() {
            const nav = document.querySelector('.vura-nav');
            const mobileToggle = document.querySelector('.nav-mobile-toggle');
            const navMenu = document.querySelector('ul.nav-menu');
            const profileLi = document.querySelector('.nav-profile');
            const profileBtn = document.querySelector('.nav-profile-btn');

            if (!nav || !navMenu) return;

            /* Hambúrguer */
            mobileToggle?.addEventListener('click', e => {
                e.stopPropagation();
                const isOpen = navMenu.classList.toggle('nav-menu--open');
                mobileToggle.setAttribute('aria-expanded', isOpen);
                mobileToggle.innerHTML = isOpen
                    ? '<i class="fa-solid fa-xmark"></i>'
                    : '<i class="fa-solid fa-bars"></i>';
                if (!isOpen) closeAll();
            });

            /* Submenus por clique no mobile */
            document.querySelectorAll('ul.nav-menu > li').forEach(li => {
                const sub = li.querySelector('.nav-submenu, .nav-profile-dropdown');
                const trigger = li.querySelector('a, button');
                if (!sub || !trigger) return;

                trigger.addEventListener('click', e => {
                    if (!isMobile()) return;
                    e.preventDefault();
                    e.stopPropagation();
                    const isOpen = li.classList.contains('sub--open');
                    closeAll();
                    if (!isOpen) open(li);
                });
            });

            /* Botão de perfil no desktop — toggle ao clicar */
            profileBtn?.addEventListener('click', e => {
                e.stopPropagation();
                if (isMobile()) return;
                const isOpen = profileLi.classList.contains('sub--open');
                closeAll();
                if (!isOpen) open(profileLi);
            });

            /* Cliques dentro do dropdown não propagam para o document (evita fechar imediatamente) */
            profileLi?.querySelector('.nav-profile-dropdown')
                ?.addEventListener('click', e => e.stopPropagation());

            /* Cliques nos submenus de conteúdo não fecham o drawer mobile */
            nav.querySelectorAll('.nav-submenu').forEach(sub => {
                sub.addEventListener('click', e => e.stopPropagation());
            });

            /* Fechar ao clicar fora do nav */
            document.addEventListener('click', () => {
                closeAll();
                if (isMobile() && navMenu.classList.contains('nav-menu--open')) {
                    navMenu.classList.remove('nav-menu--open');
                    if (mobileToggle) mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
                }
            });

            /* ESC fecha tudo */
            document.addEventListener('keydown', e => {
                if (e.key !== 'Escape') return;
                closeAll();
                navMenu.classList.remove('nav-menu--open');
                if (mobileToggle) mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
            });

            /* Resize — limpa estados mobile */
            window.addEventListener('resize', () => {
                if (isMobile()) return;
                closeAll();
                navMenu.classList.remove('nav-menu--open');
                if (mobileToggle) mobileToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
                const dropdown = profileLi?.querySelector('.nav-profile-dropdown');
                if (dropdown) dropdown.style.display = '';
            });

            /* ── Helpers ── */
            function isMobile() { return window.innerWidth <= 780; }

            function open(li) {
                li.classList.add('sub--open');
                const sub = li.querySelector('.nav-submenu, .nav-profile-dropdown');
                if (sub) sub.style.display = 'block';
                li.querySelector('.fa-chevron-down')?.style.setProperty('transform', 'rotate(180deg)');
            }

            function closeAll() {
                document.querySelectorAll('ul.nav-menu > li.sub--open').forEach(li => {
                    li.classList.remove('sub--open');
                    const sub = li.querySelector('.nav-submenu, .nav-profile-dropdown');
                    if (sub) sub.style.display = '';
                    const ch = li.querySelector('.fa-chevron-down');
                    if (ch) ch.style.transform = '';
                });
            }
        }

        /* ── 7. Init ── */
        function init() {
            injectNav();
            markActive();
            initLogout();
            initInteractions();
            document.dispatchEvent(new Event('vura:nav-ready'));
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }

    })();