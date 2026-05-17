require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const bcrypt     = require('bcrypt');
const pool       = require('./db');
const crypto     = require('crypto');
const nodemailer = require('nodemailer');
const fetch      = require('node-fetch'); // npm install node-fetch@2

const app  = express();
const PORT = 3000;

const FREEASTRO_API_KEY = process.env.FREEASTRO_API_KEY || '';
const FREEASTRO_BASE    = 'https://astro-api-1qnc.onrender.com';

app.use(cors());
app.use(express.json({ limit: '10mb' })); // SVG pode ser grande

// ════════════════════════════════════════════════════════════
// CADASTRO
// ════════════════════════════════════════════════════════════
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha)
    return res.status(400).json({ erro: 'Preencha todos os campos.' });

  if (senha.length < 6)
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });

  try {
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0)
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });

    const senhaCriptografada = await bcrypt.hash(senha, 10);
    await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaCriptografada]
    );

    return res.status(201).json({ mensagem: 'Conta criada com sucesso!' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// ════════════════════════════════════════════════════════════
// LOGIN
// ════════════════════════════════════════════════════════════
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha)
    return res.status(400).json({ erro: 'Preencha todos os campos.' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE', [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });

    const usuario = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta)
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });

    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
});

// ════════════════════════════════════════════════════════════
// ESQUECI A SENHA
// ════════════════════════════════════════════════════════════
app.post('/esqueci-senha', async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (rows.length === 0)
      return res.status(404).json({ erro: 'Usuário não encontrado.' });

    const usuario = rows[0];
    const token   = crypto.randomBytes(32).toString('hex');
    const expira  = new Date(Date.now() + 1000 * 60 * 15);

    await pool.query(
      'INSERT INTO recuperacao_senha (usuario_id, token, expira_em) VALUES (?,?,?)',
      [usuario.id, token, expira]
    );

    const link = `http://localhost:5500/resetar.html?token=${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Recuperação de senha Vura',
      html: `<h1>Recupere sua senha de acesso Vura</h1><br><a href="${link}">Redefinir senha</a>`,
    });

    return res.status(200).json({ mensagem: 'E-mail de recuperação enviado.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Ocorreu um erro interno.' });
  }
});

// ════════════════════════════════════════════════════════════
// GEO — autocomplete de cidades
// ════════════════════════════════════════════════════════════
app.get('/api/api-geo', async (req, res) => {
  const termo  = String(req.query.q || '').trim();
  const limite = Math.min(parseInt(String(req.query.limit || '8'), 10), 20);

  if (termo.length < 2)
    return res.status(400).json({ error: 'Digite ao menos 2 caracteres.' });

  try {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.searchParams.set('name',     termo);
    url.searchParams.set('count',    String(limite));
    url.searchParams.set('language', 'pt');
    url.searchParams.set('format',   'json');
    url.searchParams.set('timezone', 'auto');

    const resposta = await fetch(url.toString());
    if (!resposta.ok)
      return res.status(502).json({ error: 'Falha ao consultar Open-Meteo.' });

    const dados   = await resposta.json();
    const results = (dados.results || []).map(item => ({
      name:     item.name,
      country:  item.country || '',
      lat:      Number(item.latitude),
      lng:      Number(item.longitude),
      timezone: item.timezone || 'UTC',
    }));

    return res.status(200).json({ results });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno em /api/api-geo.' });
  }
});

// ════════════════════════════════════════════════════════════
// MANDALA — gera SVG do mapa natal
// ════════════════════════════════════════════════════════════
app.post('/api/api-mandala', async (req, res) => {
  const d = req.body;

  const camposObrigatorios = ['name','year','month','day','hour','minute','city','lat','lng','tz_str'];
  for (const campo of camposObrigatorios) {
    if (d[campo] === undefined || d[campo] === null || d[campo] === '')
      return res.status(400).json({ error: `Campo obrigatório: ${campo}` });
  }

  if (!FREEASTRO_API_KEY)
    return res.status(500).json({ error: 'FREEASTRO_API_KEY não configurada.' });

  const payload = {
    name:   String(d.name),
    year:   Number(d.year),
    month:  Number(d.month),
    day:    Number(d.day),
    hour:   Number(d.hour),
    minute: Number(d.minute),
    city:   String(d.city),
    lat:    Number(d.lat),
    lng:    Number(d.lng),
    tz_str: String(d.tz_str),
    zodiac_type:  d.zodiac_type  || 'tropical',
    house_system: d.house_system || 'placidus',
    format:        'svg',
    size:          Number(d.size || 900),
    theme_type:    d.theme_type || 'light',
    show_metadata: true,
    display_settings: { chiron: true, lilith: true, north_node: true, south_node: true, asc: true, mc: true },
    chart_config: {
      show_color_background:        false,
      sign_ring_thickness_fraction:  0.17,
      house_ring_thickness_fraction: 0.07,
      planet_symbol_scale:           0.40,
      sign_symbol_scale:             0.62,
    },
  };

  try {
    const resposta = await fetch(`${FREEASTRO_BASE}/api/v1/natal/chart/`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': FREEASTRO_API_KEY },
      body:    JSON.stringify(payload),
    });

    if (!resposta.ok) {
      const texto = await resposta.text();
      return res.status(resposta.status).json({ error: 'FreeAstro retornou erro ao gerar SVG.', raw: texto });
    }

    const svg = await resposta.text();
    return res.status(200).json({ svg });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno em /api/api-mandala.' });
  }
});

// ════════════════════════════════════════════════════════════
// NATAL — calcula dados do mapa natal (planetas, casas, etc)
// ════════════════════════════════════════════════════════════
app.post('/api/api-natal', async (req, res) => {
  const d = req.body;

  const camposObrigatorios = ['name','year','month','day','hour','minute','city','lat','lng','tz_str'];
  for (const campo of camposObrigatorios) {
    if (d[campo] === undefined || d[campo] === null || d[campo] === '')
      return res.status(400).json({ error: `Campo obrigatório: ${campo}` });
  }

  if (!FREEASTRO_API_KEY)
    return res.status(500).json({ error: 'FREEASTRO_API_KEY não configurada.' });

  const payload = {
    name:   String(d.name),
    year:   Number(d.year),
    month:  Number(d.month),
    day:    Number(d.day),
    hour:   Number(d.hour),
    minute: Number(d.minute),
    city:   String(d.city),
    lat:    Number(d.lat),
    lng:    Number(d.lng),
    tz_str: String(d.tz_str),
    house_system:      'placidus',
    zodiac_type:       'tropical',
    include_speed:     true,
    include_dominants: true,
    include_features:  ['chiron', 'lilith', 'true_node'],
    interpretation:    { enable: true, style: 'improved' },
  };

  try {
    const resposta = await fetch(`${FREEASTRO_BASE}/api/v1/natal/calculate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': FREEASTRO_API_KEY },
      body:    JSON.stringify(payload),
    });

    if (!resposta.ok) {
      const texto = await resposta.text();
      return res.status(resposta.status).json({ error: 'FreeAstroAPI retornou erro.', raw: texto });
    }

    const json = await resposta.json();
    return res.status(200).json(json);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno em /api/api-natal.' });
  }
});

// ════════════════════════════════════════════════════════════
// MAPAS — CRUD de mapas natais salvos
// ════════════════════════════════════════════════════════════

// POST /api/mapas — salva mapa
app.post('/api/mapas', async (req, res) => {
  const { usuario_id, nome, data_nasc, hora_nasc, cidade, lat, lng, tz_str, dados_json, svg, apelido } = req.body;

  const obrigatorios = { usuario_id, nome, data_nasc, hora_nasc, cidade, lat, lng, tz_str, dados_json };
  for (const [campo, valor] of Object.entries(obrigatorios)) {
    if (valor === undefined || valor === null || valor === '')
      return res.status(400).json({ error: `Campo obrigatório ausente: ${campo}` });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO mapas_natais (usuario_id, nome, data_nasc, hora_nasc, cidade, lat, lng, tz_str, dados_json, svg, apelido)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(usuario_id), String(nome), String(data_nasc), String(hora_nasc),
        String(cidade), Number(lat), Number(lng), String(tz_str),
        JSON.stringify(dados_json), svg || null, apelido || null,
      ]
    );
    return res.status(201).json({ mensagem: 'Mapa salvo com sucesso!', id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno ao salvar mapa.' });
  }
});

// GET /api/mapas?usuario_id=X  ou  /api/mapas?id=X
app.get('/api/mapas', async (req, res) => {
  const { usuario_id, id } = req.query;

  try {
    if (id) {
      const [rows] = await pool.execute(
        'SELECT * FROM mapas_natais WHERE id = ? LIMIT 1', [Number(id)]
      );
      if (!rows.length) return res.status(404).json({ error: 'Mapa não encontrado.' });
      const mapa = rows[0];
      mapa.dados_json = JSON.parse(mapa.dados_json);
      return res.status(200).json(mapa);
    }

    if (!usuario_id)
      return res.status(400).json({ error: 'Informe usuario_id ou id na query.' });

    const [rows] = await pool.execute(
      `SELECT id, nome, apelido, data_nasc, hora_nasc, cidade, criado_em
       FROM mapas_natais WHERE usuario_id = ? ORDER BY criado_em DESC`,
      [Number(usuario_id)]
    );
    return res.status(200).json({ mapas: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno ao buscar mapas.' });
  }
});

// DELETE /api/mapas?id=X&usuario_id=X
app.delete('/api/mapas', async (req, res) => {
  const { id, usuario_id } = req.query;

  if (!id || !usuario_id)
    return res.status(400).json({ error: 'Informe id e usuario_id na query.' });

  try {
    const [result] = await pool.execute(
      'DELETE FROM mapas_natais WHERE id = ? AND usuario_id = ?',
      [Number(id), Number(usuario_id)]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Mapa não encontrado ou não pertence a este usuário.' });

    return res.status(200).json({ mensagem: 'Mapa removido com sucesso.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno ao deletar mapa.' });
  }
});

// ════════════════════════════════════════════════════════════
// START
// ════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`Servidor Vura rodando em http://localhost:${PORT}`);
});