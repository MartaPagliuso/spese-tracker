const express = require('express');
const pool = require('../db');

const router = express.Router();

// -------------- GET -------------- 

router.get('/', async (req, res) => {
  const { tipo } = req.query;

  if (tipo !== undefined && !['entrata', 'uscita'].includes(tipo))
    return res.status(400).json({ errore: 'Tipo inserito non valido.'});

  try {
    const result = await pool.query(`
      SELECT id, nome, tipo
      FROM categoria
      WHERE ($1::text IS NULL OR tipo = $1)
      ORDER BY tipo, nome`,
    [tipo ?? null]);

    res.json(result.rows);

  } catch (error) {
    console.error('Errore nella lettuara delle categorie: ', error);
    res.status(500).json({ errore: 'Errore interno al server' });
  }
});

module.exports = router;