const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, portafoglio, saldo FROM saldo_portafoglio ORDER BY portafoglio');
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel leggere i portafogli: ', error);
    res.status(500).json({ errore: 'Errore interno del server' });
  }
});

module.exports = router;