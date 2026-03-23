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

    let data = {};
    try { data = await resp.clone().json(); } catch (_) {}
    const retryMs = data?.response?.retry_after_ms ?? 1200;
    const jitter  = Math.random() * 300;
    const delay   = retryMs * Math.pow(2, tentativa) + jitter;

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
    house_system: "placidus",
    zodiac_type:  "tropical",
    theme_type:   "light",
    size: 900,
    lang: "pt",
  };

  try {
    definirStatus("Gerando mandala...");
    elResultado.innerHTML = `<div style="color:#a9b6d3; font-size:14px;">Gerando visual...</div>`;

    const respostaSvg = await fetchComRetry(`${API_BASE}/api/api-mandala`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const dadosSvg = await respostaSvg.json();

    if (!respostaSvg.ok) throw new Error(dadosSvg?.error || "Falha ao gerar mandala.");

    const svg = dadosSvg.svg || dadosSvg.chart_svg || dadosSvg.output_svg || dadosSvg?.result?.svg || dadosSvg?.data?.svg;
    if (!svg) throw new Error("SVG nao encontrado na resposta.");

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

    definirStatus("Pronto!");
  } catch (erro) {
    definirStatus(erro.message);
  }
});