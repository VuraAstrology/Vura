// mandala.js
const API_BASE = "http://localhost:3000";

const pegarEl = (id) => document.getElementById(id);

const formulario = pegarEl("formMandala");
const elStatus = pegarEl("status");
const elResultado = pegarEl("output");
const inputCidade = pegarEl("city");
const listaCidades = pegarEl("cityList");

let cidadeSelecionada = null;
let timerDebounce = null;

// ================= MAPEAMENTO API → JSON LOCAL =================
const mapaId = {
  sun: "sol",
  moon: "lua",
  mercury: "mercurio",
  venus: "venus",
  mars: "marte",
  jupiter: "jupiter",
  saturn: "saturno",
  uranus: "urano",
  neptune: "netuno",
  pluto: "plutao",
  lilith: "lilith",
  chiron: "quiron",
};

// ================= STATUS =================
function definirStatus(mensagem) {
  elStatus.textContent = mensagem || "";
}

// ================= USUÁRIO LOGADO =================
function getUsuario() {
  try {
    const raw = localStorage.getItem("vura_usuario") ?? sessionStorage.getItem("vura_usuario");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ================= RETRY COM BACKOFF =================
async function fetchComRetry(url, options, maxTentativas = 3) {
  for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
    const resp = await fetch(url, options);

    if (resp.status !== 429) return resp;

    let data = {};
    try { data = await resp.clone().json(); } catch (_) { }
    const retryMs = data?.response?.retry_after_ms ?? 1200;
    const jitter = Math.random() * 300;
    const delay = retryMs * Math.pow(2, tentativa) + jitter;

    definirStatus(`Limite da API atingido - aguardando ${Math.round(delay / 1000)}s (tentativa ${tentativa + 1}/${maxTentativas})...`);
    await new Promise((r) => setTimeout(r, delay));
  }
  throw new Error("Limite de tentativas excedido. Tente novamente em alguns segundos.");
}

// ================= AUTOCOMPLETE =================
function mostrarSugestoes(cidades) {
  if (!cidades || cidades.length === 0) {
    listaCidades.hidden = true;
    listaCidades.innerHTML = "";
    return;
  }

  listaCidades.hidden = false;
  listaCidades.innerHTML = cidades.map((cidade, idx) => `
    <button type="button" data-idx="${idx}">
      ${cidade.name} (${cidade.country}) - ${cidade.timezone}
    </button>
  `).join("");

  listaCidades.querySelectorAll("button").forEach((botao) => {
    botao.addEventListener("click", () => {
      cidadeSelecionada = cidades[Number(botao.dataset.idx)];

      inputCidade.value = `${cidadeSelecionada.name} (${cidadeSelecionada.country})`;
      pegarEl("lat").value = cidadeSelecionada.lat;
      pegarEl("lng").value = cidadeSelecionada.lng;
      pegarEl("tz").value = cidadeSelecionada.timezone;

      mostrarSugestoes([]);
      definirStatus("");
    });
  });
}

inputCidade.addEventListener("input", () => {
  cidadeSelecionada = null;
  pegarEl("lat").value = "";
  pegarEl("lng").value = "";
  pegarEl("tz").value = "";

  clearTimeout(timerDebounce);

  const termo = inputCidade.value.trim();
  if (termo.length < 2) { mostrarSugestoes([]); return; }

  timerDebounce = setTimeout(async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/api-geo?q=${encodeURIComponent(termo)}&limit=8`);
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados?.error || "Erro ao buscar cidades.");
      mostrarSugestoes(dados.results || []);
    } catch (erro) {
      mostrarSugestoes([]);
      definirStatus(erro.message);
    }
  }, 250);
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".mandala-autocomplete")) mostrarSugestoes([]);
});

// ================= SALVAR MAPA NO BANCO =================
async function salvarMapa({ payload, dadosNatal, svg }) {
  const usuario = getUsuario();

  // Silencioso: se não estiver logado, não salva e não mostra erro
  if (!usuario?.id) return;

  const dataNasc = `${payload.year}-${String(payload.month).padStart(2, "0")}-${String(payload.day).padStart(2, "0")}`;
  const horaNasc = `${String(payload.hour).padStart(2, "0")}:${String(payload.minute).padStart(2, "0")}`;

  try {
    const resp = await fetch(`${API_BASE}/api/mapas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: usuario.id,
        nome:       payload.name,
        data_nasc:  dataNasc,
        hora_nasc:  horaNasc,
        cidade:     payload.city,
        lat:        payload.lat,
        lng:        payload.lng,
        tz_str:     payload.tz_str,
        dados_json: dadosNatal,
        svg:        svg,
        apelido:    payload.name, // usa o nome do formulário como apelido inicial
      }),
    });

    if (!resp.ok) {
      const erro = await resp.json();
      console.warn("[salvarMapa] Erro ao salvar:", erro);
    }
    // Sucesso silencioso — o usuário já viu o mapa, não precisa de alert
  } catch (erro) {
    // Não interrompe a experiência se o banco falhar
    console.warn("[salvarMapa] Falha na requisição:", erro);
  }
}

// ================= GERAR MANDALA =================
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!cidadeSelecionada) { definirStatus("Selecione uma cidade na lista."); return; }

  const valorData = pegarEl("date").value;
  const valorHora = pegarEl("time").value;
  if (!valorData || !valorHora) { definirStatus("Preencha data e hora."); return; }

  const [ano, mes, dia] = valorData.split("-").map(Number);
  const [hora, minuto] = valorHora.split(":").map(Number);

  const payload = {
    name:        pegarEl("name").value.trim(),
    year:        ano,
    month:       mes,
    day:         dia,
    hour:        hora,
    minute:      minuto,
    city:        cidadeSelecionada.name,
    lat:         cidadeSelecionada.lat,
    lng:         cidadeSelecionada.lng,
    tz_str:      cidadeSelecionada.timezone,
    house_system: "placidus",
    zodiac_type:  "tropical",
    theme_type:   "light",
    size:         900,
    lang:         "pt",
  };

  try {
    definirStatus("Gerando mandala...");
    elResultado.innerHTML = `<div style="color:#a9b6d3; font-size:14px; padding: 20px;">Gerando visual...</div>`;

    // Dispara as duas chamadas em paralelo
    const [respostaSvg, respostaNatal] = await Promise.all([
      fetchComRetry(`${API_BASE}/api/api-mandala`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
      fetchComRetry(`${API_BASE}/api/api-natal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    ]);

    const dadosSvg   = await respostaSvg.json();
    const dadosNatal = await respostaNatal.json();

    if (!respostaSvg.ok) throw new Error(dadosSvg?.error || "Falha ao gerar mandala.");

    const svg = dadosSvg.svg || dadosSvg.chart_svg || dadosSvg.output_svg || dadosSvg?.result?.svg || dadosSvg?.data?.svg;
    if (!svg) throw new Error("SVG não encontrado na resposta.");

    elResultado.innerHTML = `<div id="svgWrapper">${svg}</div>`;

    const svgEl = elResultado.querySelector("svg");
    if (svgEl) {
      const w = svgEl.getAttribute("width");
      const h = svgEl.getAttribute("height");
      if (w && h && !svgEl.getAttribute("viewBox")) svgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);
      svgEl.removeAttribute("width");
      svgEl.removeAttribute("height");
      svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
      svgEl.style.cssText = "width:100%; height:auto; display:block;";
    }

    // Monta cards se a api-natal respondeu com sucesso
    if (respostaNatal.ok && dadosNatal?.planets) {
      definirStatus("Carregando posicionamentos...");
      const dados = await carregarJsonLocal();
      if (dados) {
        const areaPostcionamentos = document.getElementById("posicionamentos-area");
        areaPostcionamentos.innerHTML = "";
        const cards = montarCardsPostcionamentos(dadosNatal, dados);
        areaPostcionamentos.appendChild(cards);
      }
    }

    definirStatus("Pronto!");

    // ── Salva no banco em segundo plano (não bloqueia nem exibe erro ao usuário) ──
    salvarMapa({ payload, dadosNatal, svg });

  } catch (erro) {
    definirStatus(erro.message);
  }
});

// ================= CARREGAR JSON LOCAL =================
async function carregarJsonLocal() {
  try {
    const resp = await fetch("./assets/data/posicionamentos.json");
    if (!resp.ok) throw new Error("Não foi possível carregar os posicionamentos.");
    return await resp.json();
  } catch (erro) {
    console.error(erro);
    return null;
  }
}

// ================= FILTRAR E MONTAR CARDS =================
function montarCardsPostcionamentos(dadosNatal, jsonLocal) {
  const secao = document.createElement("div");
  secao.className = "posicionamentos-secao";

  const titulo = document.createElement("p");
  titulo.className = "posicionamentos-secao-titulo";
  titulo.textContent = "Posicionamentos";
  secao.appendChild(titulo);

  const divisor = document.createElement("div");
  divisor.className = "posicionamentos-secao-divisor";
  secao.appendChild(divisor);

  const container = document.createElement("div");
  container.className = "posicionamentos-grid";
  secao.appendChild(container);

  const indice = {};
  for (const planeta of jsonLocal.posicionamentos) {
    indice[planeta.id] = {};
    for (const signo of planeta.signos) {
      indice[planeta.id][signo.signo.toLowerCase()] = signo;
    }
  }

  const mapaSiglo = {
    aries: "áries",
    taurus: "touro",
    gemini: "gêmeos",
    cancer: "câncer",
    leo: "leão",
    virgo: "virgem",
    libra: "libra",
    scorpio: "escorpião",
    sagittarius: "sagitário",
    capricorn: "capricórnio",
    aquarius: "aquário",
    pisces: "peixes",
  };

  const posicionamentos = [];

  for (const planeta of dadosNatal.planets) {
    const idLocal = mapaId[planeta.id];
    if (!idLocal) continue;

    const nomeSigno = mapaSiglo[planeta.sign_id];
    if (!nomeSigno) continue;

    const dadosPlaneta = jsonLocal.posicionamentos.find(p => p.id === idLocal);
    const dadosSigno = indice[idLocal]?.[nomeSigno];
    if (!dadosPlaneta || !dadosSigno) continue;

    posicionamentos.push({
      planeta: dadosPlaneta,
      signo: dadosSigno,
      retrogrado: planeta.retrograde,
    });
  }

  const asc = dadosNatal.angles_details?.asc;
  if (asc) {
    const nomeSigno = mapaSiglo[asc.sign_id];
    const dadosPlaneta = jsonLocal.posicionamentos.find(p => p.id === "ascendente");
    const dadosSigno = indice["ascendente"]?.[nomeSigno];
    if (dadosPlaneta && dadosSigno) {
      posicionamentos.push({ planeta: dadosPlaneta, signo: dadosSigno, retrogrado: false });
    }
  }

  const mc = dadosNatal.angles_details?.mc;
  if (mc) {
    const nomeSigno = mapaSiglo[mc.sign_id];
    const dadosPlaneta = jsonLocal.posicionamentos.find(p => p.id === "meioDoCeu");
    const dadosSigno = indice["meioDoCeu"]?.[nomeSigno];
    if (dadosPlaneta && dadosSigno) {
      posicionamentos.push({ planeta: dadosPlaneta, signo: dadosSigno, retrogrado: false });
    }
  }

  for (const { planeta, signo, retrogrado } of posicionamentos) {
    const card = document.createElement("div");
    card.className = "posicionamento-card";

    card.innerHTML = `
      <div class="posicionamento-card-header">
        <div class="posicionamento-simbolos">
          <span class="posicionamento-simbolo-planeta">${planeta.simbolo}</span>
          <span class="posicionamento-seta">→</span>
          <span class="posicionamento-simbolo-signo">${signo.simbolo}</span>
        </div>
        <div class="posicionamento-titulo">
          <h3>${planeta.nome} em ${signo.signo}${retrogrado ? " <span class='retrogrado'>℞</span>" : ""}</h3>
        </div>
      </div>
      <p class="posicionamento-introducao">${planeta.introducao}</p>
      <p class="posicionamento-texto">${signo.texto}</p>
    `;

    container.appendChild(card);
  }

  return secao;
}