// api/geo.js
// AUTOCOMPLETE de cidades (Open-Meteo)
// Retorna: { results: [ { name, country, lat, lng, timezone } ] }
// Não depende de nenhum pacote externo — timezone vem direto da Open-Meteo

export default async function handler(req, res) {
  const origem = req.headers.origin || "";
  const permitidas = [
    "https://vuraastrology.github.io",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://localhost:3000",
  ];
  res.setHeader("Access-Control-Allow-Origin", permitidas.includes(origem) ? origem : permitidas[0]);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const termo = String(req.query.q || "").trim();
    const limite = Math.min(parseInt(String(req.query.limit || "8"), 10), 20);

    if (termo.length < 2) {
      return res.status(400).json({
        error: "Digite ao menos 2 caracteres para buscar a cidade.",
      });
    }

    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.searchParams.set("name", termo);
    url.searchParams.set("count", String(limite));
    url.searchParams.set("language", "pt");
    url.searchParams.set("format", "json");
    url.searchParams.set("timezone", "auto"); // Open-Meteo já devolve o timezone correto

    const resposta = await fetch(url.toString());

    if (!resposta.ok) {
      const corpoTexto = await resposta.text().catch(() => "");
      return res.status(502).json({
        error: "Falha ao consultar serviço de cidades (Open-Meteo).",
        status: resposta.status,
        details: corpoTexto || "Sem detalhes.",
      });
    }

    const dados = await resposta.json();

    const results = (dados.results || []).map((item) => ({
      name:     item.name,
      country:  item.country || "",
      lat:      Number(item.latitude),
      lng:      Number(item.longitude),
      timezone: item.timezone || "UTC", // vem direto da API, sem tz-lookup
    }));

    return res.status(200).json({ results });

  } catch (erro) {
    return res.status(500).json({
      error: "Erro interno ao buscar cidades (/api/geo).",
      details: String(erro?.stack || erro),
    });
  }
}