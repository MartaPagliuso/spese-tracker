const express = require('express');
const pool = require('../db');

const router = express.Router();

// -------------- GET --------------

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, portafoglio, saldo FROM saldo_portafoglio ORDER BY portafoglio');
    res.json(result.rows);
  } catch (error) {
    console.error('Errore nel leggere i portafogli: ', error);
    res.status(500).json({ errore: 'Errore interno del server' });
  }
});

// -------------- POST --------------

router.post('/', async(req, res) => {
  const { nome } = req.body ?? {};

  if (typeof nome !== 'string')
    return res.status(400).json({ errore: 'Il nome è obbligatorio' });

  const nomePulito = nome.trim();

  if (nomePulito === '')
    return res.status(400).json({ errore: 'Il nome non può essere vuoto' });

  try {
    const result = await pool.query(
      `INSERT INTO portafoglio (nome, utente_id)
      SELECT $1::text, id FROM utente ORDER BY id LIMIT 1
      RETURNING id, nome, archiviato`, [nomePulito]
    );

    if (result.rows.length === 0) {
      console.error('Non esiste alcun utente nel database');
      return res.status(500).json({ errore: 'Errore interno del server' });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505')
      return res.status(409).json({ errore: 'Il nome inserito è già stato usato.' });

    console.error('Errore nel creare il portafoglio: ', error);
    return res.status(500).json({ errore: 'Errore interno del server.' });
  }
});




module.exports = router;