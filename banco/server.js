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



// _____ESQUECI A SENHA DA MINHA CONTA _______________________________________________________________________
app.post('/esqueci-senha', async (req, res) =>{
  const {email} = req.body;
  try {
    const [row] = await pool.query('SELECT * FROM usuarios WHERE email = ?',[email]);
    if (rows.length === 0){
      return res.status(404).json({erro: 'Usuário não encontrado.'});
    }
    const usuario = rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 1000 * 60 * 15 );
    await pool.query('INSERT INTO recuperacao_senha (usuario_id, token, expira_em) VALUES (?,?,?)',[
      usuario.id,
      token,
      expira
    ]);
    const link = 'https://localhost:5500/resetar.html?token=${token}';
    await transporter.sendMail({
      to: email,
      subject: 'Recuperação de senha Vura',
      html:'<h1>Recupere sua senha de acesso Vura</h1><br><a href="${link}" >Redefinir senha</a>'
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({erro: 'Ocorreu um erro interno.'});
  }

});

//___________________RESETAR MINHA SENHA (nova senha/atualização)___________________________________________





// ─── START ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor Vura rodando em http://localhost:${PORT}`);
});