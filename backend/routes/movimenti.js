const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.id, m.data::text as data, p.nome as portafoglio, c.nome as categoria, c.tipo, m.importo, m.descrizione
      FROM movimento m
      JOIN portafoglio p ON p.id = m.portafoglio_id
      JOIN categoria c ON c.id = m.categoria_id
      ORDER BY m.data DESC, m.id DESC
    `);

    res.json(result.rows);

  } catch (error) {
    console.error('Errore nel leggere i movimenti: ', error);
    res.status(500).json({ errore: 'Errore interno al server'});
  }
});

module.exports = router;