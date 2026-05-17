// api/mapas.js
// CRUD de mapas natais por usuário
// Rotas:
//   POST   /api/mapas        → salva um mapa
//   GET    /api/mapas?usuario_id=X  → lista mapas do usuário
//   DELETE /api/mapas?id=X   → remove um mapa (só do próprio usuário)

import mysql from 'mysql2/promise';

/* ── Conexão reutilizável (pool) ── */
let pool;
function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host:               process.env.DB_HOST,
            port:               Number(process.env.DB_PORT || 3306),
            user:               process.env.DB_USER,
            password:           process.env.DB_PASSWORD,
            database:           process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit:    5,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
        });
    }
    return pool;
}

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


    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        const db = getPool();

        /* ── POST — Salvar mapa ── */
        if (req.method === 'POST') {
            const body = await lerBodyJson(req);

            const {
                usuario_id,
                nome, data_nasc, hora_nasc,
                cidade, lat, lng, tz_str,
                dados_json, svg,
                apelido
            } = body;

            // Validação mínima
            const obrigatorios = { usuario_id, nome, data_nasc, hora_nasc, cidade, lat, lng, tz_str, dados_json };
            for (const [campo, valor] of Object.entries(obrigatorios)) {
                if (valor === undefined || valor === null || valor === '') {
                    return res.status(400).json({ error: `Campo obrigatório ausente: ${campo}` });
                }
            }

            const [result] = await db.execute(
                `INSERT INTO mapas_natais
                    (usuario_id, nome, data_nasc, hora_nasc, cidade, lat, lng, tz_str, dados_json, svg, apelido)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    Number(usuario_id),
                    String(nome),
                    String(data_nasc),   // "YYYY-MM-DD"
                    String(hora_nasc),   // "HH:MM"
                    String(cidade),
                    Number(lat),
                    Number(lng),
                    String(tz_str),
                    JSON.stringify(dados_json),
                    svg || null,
                    apelido || null
                ]
            );

            return res.status(201).json({
                mensagem: 'Mapa salvo com sucesso!',
                id: result.insertId
            });
        }

        /* ── GET — Listar mapas do usuário ── */
        if (req.method === 'GET') {
            const { usuario_id, id } = req.query;

            // GET /api/mapas?id=X  → retorna um mapa completo (incluindo SVG e dados_json)
            if (id) {
                const [rows] = await db.execute(
                    `SELECT * FROM mapas_natais WHERE id = ? LIMIT 1`,
                    [Number(id)]
                );
                if (!rows.length) return res.status(404).json({ error: 'Mapa não encontrado.' });

                const mapa = rows[0];
                mapa.dados_json = JSON.parse(mapa.dados_json);
                return res.status(200).json(mapa);
            }

            // GET /api/mapas?usuario_id=X  → lista resumida (sem SVG para economizar tráfego)
            if (!usuario_id) {
                return res.status(400).json({ error: 'Informe usuario_id ou id na query.' });
            }

            const [rows] = await db.execute(
                `SELECT id, nome, apelido, data_nasc, hora_nasc, cidade, criado_em
                 FROM mapas_natais
                 WHERE usuario_id = ?
                 ORDER BY criado_em DESC`,
                [Number(usuario_id)]
            );

            return res.status(200).json({ mapas: rows });
        }

        /* ── DELETE — Remover mapa ── */
        if (req.method === 'DELETE') {
            const { id, usuario_id } = req.query;

            if (!id || !usuario_id) {
                return res.status(400).json({ error: 'Informe id e usuario_id na query.' });
            }

            // Garante que o mapa pertence ao usuário antes de deletar
            const [result] = await db.execute(
                `DELETE FROM mapas_natais WHERE id = ? AND usuario_id = ?`,
                [Number(id), Number(usuario_id)]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Mapa não encontrado ou não pertence a este usuário.' });
            }

            return res.status(200).json({ mensagem: 'Mapa removido com sucesso.' });
        }

        return res.status(405).json({ error: 'Método não permitido.' });

    } catch (erro) {
        console.error('[/api/mapas]', erro);
        return res.status(500).json({
            error: 'Erro interno em /api/mapas.',
            details: String(erro?.message || erro)
        });
    }
}

async function lerBodyJson(req) {
    return new Promise((resolve, reject) => {
        let bruto = '';
        req.on('data', chunk => (bruto += chunk));
        req.on('end', () => {
            try { resolve(bruto ? JSON.parse(bruto) : {}); }
            catch (e) { reject(e); }
        });
    });
}