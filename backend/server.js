require('dotenv').config();

const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// per leggere il file env e prendere la connessione al db
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => console.error('Errore sul pool:', err));

app.get('/api/portafogli', async (req, res)  => {
  try {
    const result = await pool.query('SELECT id, portafoglio, saldo FROM saldo_portafoglio ORDER BY portafoglio');
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel leggere i portafogli: ', error);
    res.status(500).json({ errore: 'Errore interno del server' });
  }
});

app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});