const express = require('express');
const pool = require('../db');

const router = express.Router();

// -------------- GET --------------

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT t.id, t.data::text as data, o.nome as origine, d.nome as destinazione, t.importo, t.descrizione
        FROM trasferimento t
        JOIN portafoglio o ON o.id = t.portafoglio_origine_id
        JOIN portafoglio d ON d.id = t.portafoglio_destinazione_id
        ORDER BY t.data DESC
      `);

    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel leggere i trasferimenti: ', error);
    res.status(500).json({ errore: 'Errore interno del server.' });
  }
});




module.exports = router;