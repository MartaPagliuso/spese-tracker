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

// -------------- DELETE --------------

router.delete('/:id', async(req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM portafoglio WHERE id = $1 RETURNING id`, [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ errore: 'Il portafoglio che si vuole eliminare non esiste.' });

    res.status(204).send();
  } catch (error) {
    if (error.code?.startsWith('22'))
      return res.status(400).json({ errore: 'Tipo di dato non valido' });
    if (error.code === '23503' || error.code === '23001')
      return res.status(409).json({ errore: 'Il portafoglio ha movimenti o trasferimenti collegati' });

    console.error('Codice errore:', error.code, '-', error.message);
    console.error('Errore durante l\'eliminazione del portafoglio: ', error);
    return res.status(500).json({ errore: 'Errore interno del server.' });
  }
});

// -------------- PATCH --------------

router.patch('/:id', async(req, res) => {
  const { archiviato } = req.body ?? {};
  const { id } = req.params;

  if (typeof archiviato !== 'boolean')
    return res.status(400).json({ errore: 'Tipo di dato non valido.' });

  try {
    const result = await pool.query(
      `UPDATE portafoglio SET archiviato = $2
      WHERE id = $1 RETURNING id, nome, archiviato`,
      [id, archiviato]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ errore: 'Il portafoglio non esiste.' });

    res.status(200).json(result.rows[0]);
  } catch (error) {
    if (error.code?.startsWith('22'))
      return res.status(400).json({ errore: 'Tipo di dato non valido.' });

    console.error('Errore durante la modifica del portafoglio: ', error);
    return res.status(500).json({ errore: 'Errore interno del server.' });
  }
});


module.exports = router;