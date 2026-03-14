// mandala.js
const API_BASE = "https://vura-wine.vercel.app";

const pegarEl = (id) => document.getElementById(id);

const formulario   = pegarEl("formMandala");
const elStatus     = pegarEl("status");
const elResultado  = pegarEl("output");
const inputCidade  = pegarEl("city");
const listaCidades = pegarEl("cityList");

let cidadeSelecionada = null;
let timerDebounce = null;

// ================= STATUS =================
function definirStatus(mensagem) {
  elStatus.textContent = mensagem || "";
}

// ================= RETRY COM BACKOFF =================
async function fetchComRetry(url, options, maxTentativas = 3) {
  for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
    const resp = await fetch(url, options);

    if (resp.status !== 429) return resp;

    // Lê o retry_after_ms sugerido pela API, com fallback de 1200ms
    let data = {};
    try { data = await resp.clone().json(); } catch (_) {}
    const retryMs  = data?.response?.retry_after_ms ?? 1200;
    const jitter   = Math.random() * 300;
    const delay    = retryMs * Math.pow(2, tentativa) + jitter;

    definirStatus(`Limite da API atingido — aguardando ${Math.round(delay / 1000)}s (tentativa ${tentativa + 1}/${maxTentativas})...`);
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
      ${cidade.name} (${cidade.country}) — ${cidade.timezone}
    </button>
  `).join("");

  listaCidades.querySelectorAll("button").forEach((botao) => {
    botao.addEventListener("click", () => {
      cidadeSelecionada = cidades[Number(botao.dataset.idx)];

      inputCidade.value    = `${cidadeSelecionada.name} (${cidadeSelecionada.country})`;
      pegarEl("lat").value = cidadeSelecionada.lat;
      pegarEl("lng").value = cidadeSelecionada.lng;
      pegarEl("tz").value  = cidadeSelecionada.timezone;

      mostrarSugestoes([]);
      definirStatus("");
    });
  });
}

inputCidade.addEventListener("input", () => {
  cidadeSelecionada    = null;
  pegarEl("lat").value = "";
  pegarEl("lng").value = "";
  pegarEl("tz").value  = "";

  clearTimeout(timerDebounce);

  const termo = inputCidade.value.trim();
  if (termo.length < 2) { mostrarSugestoes([]); return; }

  timerDebounce = setTimeout(async () => {
    try {
      const resp  = await fetch(`${API_BASE}/api/api-geo?q=${encodeURIComponent(termo)}&limit=8`);
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados?.error || "Erro ao buscar cidades.");
      mostrarSugestoes(dados.results || []);
    } catch (erro) {
      mostrarSugestoes([]);
      definirStatus(erro.message);
    }
  }, 250);
});

// Fecha sugestões ao clicar fora
document.addEventListener("click", (e) => {
  if (!e.target.closest(".mandala-autocomplete")) mostrarSugestoes([]);
});

// ================= GERAR MANDALA =================
formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!cidadeSelecionada) { definirStatus("Selecione uma cidade na lista."); return; }

  const valorData = pegarEl("date").value;
  const valorHora = pegarEl("time").value;
  if (!valorData || !valorHora) { definirStatus("Preencha data e hora."); return; }

  const [ano, mes, dia] = valorData.split("-").map(Number);
  const [hora, minuto]  = valorHora.split(":").map(Number);

  const payload = {
    name:   pegarEl("name").value.trim(),
    year:   ano,
    month:  mes,
    day:    dia,
    hour:   hora,
    minute: minuto,
    city:   cidadeSelecionada.name,
    lat:    cidadeSelecionada.lat,
    lng:    cidadeSelecionada.lng,
    tz_str: cidadeSelecionada.timezone,
    // valores fixos
    house_system: "placidus",
    zodiac_type:  "tropical",
    theme_type:   "light",
    size: 900,
    lang: "pt",
  };

  try {
    definirStatus("Gerando mandala...");
    elResultado.innerHTML = `<div style="color:#a9b6d3; font-size:14px;">🔄 Gerando visual...</div>`;

    // ✅ Chamadas sequenciais — respeita o limite de 1 req/s da FreeAstroAPI
    const respostaSvg = await fetchComRetry(`${API_BASE}/api/api-mandala`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    definirStatus("Mandala gerada, carregando interpretação...");
    await new Promise((r) => setTimeout(r, 1100)); // garante > 1s entre chamadas

    const respostaNatal = await fetchComRetry(`${API_BASE}/api/api-natal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const dadosSvg   = await respostaSvg.json();
    const dadosNatal = await respostaNatal.json();

    console.log("SVG:", dadosSvg);
    console.log("Natal:", dadosNatal);

    if (!respostaSvg.ok) throw new Error(dadosSvg?.error || "Falha ao gerar mandala.");

    const svg = dadosSvg.svg || dadosSvg.chart_svg || dadosSvg.output_svg || dadosSvg?.result?.svg || dadosSvg?.data?.svg;
    if (!svg) throw new Error("SVG não encontrado na resposta.");

    // Monta o SVG
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

    // Monta os cards de interpretação (se vieram)
    if (respostaNatal.ok && dadosNatal?.interpretation?.sections) {
      definirStatus("Traduzindo interpretação...");
      const secoestraduzidas = await traduzirSecoes(dadosNatal.interpretation.sections);
      elResultado.appendChild(montarCards(secoestraduzidas));
    }

    definirStatus("Pronto ✅");
  } catch (erro) {
    definirStatus(erro.message);
  }
});

// ================= TRADUÇÃO VIA CLAUDE =================
async function traduzirSecoes(secoes) {
  // Extrai todos os textos numa lista plana para traduzir em um único request
  const entradas = [];
  for (const [chave, itens] of Object.entries(secoes)) {
    if (!itens?.length) continue;
    itens.forEach((item, idx) => {
      entradas.push({ chave, idx, campo: "title", texto: item.title || item.key || "" });
      entradas.push({ chave, idx, campo: "body",  texto: item.body  || item.content || "" });
    });
  }

  if (entradas.length === 0) return secoes;

  const listaTextos = entradas
    .map((e, i) => `[${i}] ${e.texto}`)
    .join("\n");

  try {
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: `Você é um tradutor especializado em astrologia.
Traduza cada item numerado do inglês para o português brasileiro.
Mantenha os termos astrológicos corretos (ex: "Rising Sign" = "Ascendente", "Moon" = "Lua", "Sun" = "Sol", "House" = "Casa", "Trine" = "Trígono", "Square" = "Quadratura", "Conjunction" = "Conjunção", "Opposition" = "Oposição", "Sextile" = "Sextil").
Retorne APENAS um JSON válido no formato: {"translations": ["tradução 0", "tradução 1", ...]}
Sem explicações, sem markdown, sem texto extra.`,
        messages: [{ role: "user", content: listaTextos }],
      }),
    });

    const data = await resp.json();
    const raw  = data.content?.[0]?.text || "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const { translations } = JSON.parse(clean);

    // Reconstrói as seções com os textos traduzidos
    const secoesTraduzidas = structuredClone(secoes);
    entradas.forEach((e, i) => {
      const item = secoesTraduzidas[e.chave]?.[e.idx];
      if (!item || !translations[i]) return;
      if (e.campo === "title") {
        if ("title" in item) item.title = translations[i];
        else item.key = translations[i];
      } else {
        if ("body" in item) item.body = translations[i];
        else item.content = translations[i];
      }
    });
    return secoesTraduzidas;

  } catch (err) {
    console.warn("Tradução falhou, exibindo em inglês:", err);
    return secoes; // fallback: exibe em inglês se a tradução falhar
  }
}

// ================= CARDS DE INTERPRETAÇÃO =================

// Nomes legíveis para cada seção
const nomesSecoes = {
  core_self:          "Core Self",
  mind:               "Mind & Communication",
  love_relating:      "Love & Relationships",
  work_path:          "Work & Life Path",
  social_collective:  "Social & Collective",
  karmic_healing:     "Karmic & Healing",
  aspects:            "Aspects",
};

function montarCards(secoes) {
  const container = document.createElement("div");
  container.className = "interpretacao-container";

  for (const [chave, itens] of Object.entries(secoes)) {
    if (!itens || itens.length === 0) continue;

    const secao = document.createElement("div");
    secao.className = "interpretacao-secao";

    const titulo = document.createElement("h2");
    titulo.className = "interpretacao-titulo";
    titulo.textContent = nomesSecoes[chave] || chave;
    secao.appendChild(titulo);

    const grid = document.createElement("div");
    grid.className = "interpretacao-grid";

    itens.forEach((item) => {
      const card = document.createElement("div");
      card.className = "interpretacao-card";

      const tituloCard = document.createElement("h3");
      tituloCard.className = "interpretacao-card-titulo";
      tituloCard.textContent = item.title || item.key || "";

      const corpo = document.createElement("p");
      corpo.className = "interpretacao-card-corpo";
      corpo.textContent = item.body || item.content || "";

      card.appendChild(tituloCard);
      card.appendChild(corpo);
      grid.appendChild(card);
    });

    secao.appendChild(grid);
    container.appendChild(secao);
  }

  return container;
}