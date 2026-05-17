require('dotenv').config();

console.log(process.env.EMAIL_USER); // verifica se o email e a senha de acesso estão devidamente conectados com o server via nodemailer
console.log(process.env.EMAIL_PASS);

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const fetch      = require('node-fetch'); // npm install node-fetch@2

const app  = express();
const PORT = 3000;

const FREEASTRO_API_KEY = process.env.FREEASTRO_API_KEY || '';
const FREEASTRO_BASE    = 'https://astro-api-1qnc.onrender.com';

app.use(cors());
app.use(express.json({ limit: '10mb' })); // SVG pode ser grande


//________EMAIL___________________________________________________________________

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// ─── CADASTRO ────────────────────────────────────────────────────────────────
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



// _____ESQUECI A SENHA DA MINHA CONTA (envia email de recuperação de senha)_______________________________________________________________________

app.post('/esqueci', async(req,res) =>{
  const { email} = req.body;
  const emailNormalizado = email?.trim().toLowerCase();

 console.log('Email recebido:',JSON.stringify(emailNormalizado));
  try{
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?',[emailNormalizado]);
    if (rows.length === 0){
      return res.status(404).json({erro:'Usuário não encontrado, Email inválido!'});
    }
    const usuario = rows[0]; //retorna o primeiro registro do usuário encontrado
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 1000 * 60 * 15) // 15min para expirar o token de redefinição de senha
    await pool.query(`INSERT INTO recuperacao_senha (usuario_id, token, expira_em) VALUES (?,?,?)`,[usuario.id,token,expira]);

   const link = `http://localhost:5500/Vura/resetar.html?token=${token}`;
    await transporter.sendMail({
      to: email,
      subject: 'Recuperação de senha de acesso Vura',
      html:`<h2>Recuperação de senha</h2>
      <p> recupere sua senha de acesso a sua conta VURA clicando no link abaixo:</p>
      <a href="${link}">Redefinir senha</a>`
    });
    return res.status(200).json({mensagem:'Email de redefinição de senha enviado com sucesso!'});
  } catch (err){
    console.error('ERRO INTERNO:', err);
    return res.status(500).json({erro:'Não foi ímpossivel conectar com o servidor no momento, tente novamente mais tarde!'});
  }
});


//________________________resetar senha de acesso__________________________________________________________

app.post('/resetar', async (req, res) =>{
  const { token, novaSenha } = req.body;

  try{
    if (novaSenha.length < 6){
      return res.status(400).json({erro:'Senha muito pequena'});
    }
    const [rows] = await pool.query(`
      SELECT * FROM recuperacao_senha
      WHERE token = ?
      AND expira_em > NOW()`,[token]);

      if(rows.length === 0){
        return res.status(400).json({erro:'Token inválido ou expirado.'});
      }
    const recuperacao = rows[0];
    const hash = await bcrypt.hash(novaSenha,10);

    await pool.query(`
      UPDATE usuarios SET senha = ?
      WHERE id = ?`,[hash, recuperacao.usuario_id]);

      await pool.query(`DELETE FROM recuperacao_senha WHERE token = ?`, [token]);
      return res.status(200).json({mensagem:'Senha atualizada com sucesso!'});
  }catch(err){
    console.error('Não foi possível alterar a senha',err);
    return res.status(500).json({erro:'Não foi possível alterar a senha no momento tente novamente mais tarde!'});
  }
});

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
// PERFIL — atualizar nome, email e/ou senha
// ════════════════════════════════════════════════════════════
app.put('/perfil', async (req, res) => {
  const { id, nome, email, senha_atual, nova_senha } = req.body;

  if (!id || !nome || !email)
    return res.status(400).json({ erro: 'Id, nome e email são obrigatórios.' });

  try {
    // Verifica se o usuário existe
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    if (!rows.length)
      return res.status(404).json({ erro: 'Usuário não encontrado.' });

    const usuario = rows[0];

    // Verifica se o email já está em uso por outro usuário
    const [emailRows] = await pool.query(
      'SELECT id FROM usuarios WHERE email = ? AND id != ?', [email, id]
    );
    if (emailRows.length)
      return res.status(409).json({ erro: 'Este e-mail já está em uso.' });

    // Se quer mudar a senha, valida a atual
    let novaSenhaCriptografada = null;
    if (nova_senha) {
      if (!senha_atual)
        return res.status(400).json({ erro: 'Informe a senha atual.' });

      const senhaCorreta = await bcrypt.compare(senha_atual, usuario.senha);
      if (!senhaCorreta)
        return res.status(401).json({ erro: 'Senha atual incorreta.' });

      if (nova_senha.length < 6)
        return res.status(400).json({ erro: 'A nova senha deve ter ao menos 6 caracteres.' });

      novaSenhaCriptografada = await bcrypt.hash(nova_senha, 10);
    }

    // Monta a query dinamicamente
    if (novaSenhaCriptografada) {
      await pool.query(
        'UPDATE usuarios SET nome = ?, email = ?, senha = ? WHERE id = ?',
        [nome, email, novaSenhaCriptografada, id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nome = ?, email = ? WHERE id = ?',
        [nome, email, id]
      );
    }

    return res.status(200).json({ mensagem: 'Perfil atualizado com sucesso!' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
  }
});

// ════════════════════════════════════════════════════════════
// START
// ════════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log(`Servidor Vura rodando em http://localhost:${PORT}`);
});