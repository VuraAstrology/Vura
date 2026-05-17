require('dotenv').config();

console.log(process.env.EMAIL_USER); // verifica se o email e a senha de acesso estão devidamente conectados com o server via nodemailer
console.log(process.env.EMAIL_PASS);

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { error } = require('console');



const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


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

  // Validação básica
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    // Verifica se o e-mail já existe
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (rows.length > 0) {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }

    // Criptografa a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);

    // Insere o usuário
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

// ─── LOGIN ───────────────────────────────────────────────────────────────────
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Preencha todos os campos.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    const usuario = rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'E-mail ou senha inválidos.' });
    }

    // Retorna dados básicos do usuário (nunca retorne a senha!)
    return res.status(200).json({
      mensagem: 'Login realizado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
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


// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor Vura rodando em http://localhost:${PORT}`);
});