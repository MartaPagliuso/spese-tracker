const express = require('express');
const pool = require('../db');

const router = express.Router();

// -------------- GET --------------

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
    res.status(500).json({ errore: 'Errore interno del server'});
  }
});

// -------------- POST --------------

router.post('/', async (req, res) => {
  const { portafoglio_id, categoria_id, importo, data, descrizione } = req.body ?? {};

  if (portafoglio_id == null || categoria_id == null || importo == null)
    return res.status(400).json({ errore: 'Il portafoglio, la categoria e l\'importo sono obbligatori.' });

  const valore = Number(importo);

  if (!Number.isFinite(valore) || valore <= 0)
    return res.status(400).json({ errore: 'L\'importo deve essere maggiore di 0.' });

  try {
    const controllo = await pool.query(
      `SELECT archiviato FROM portafoglio WHERE id = $1`, [portafoglio_id]
    );

    if (controllo.rows.length === 0) 
      return res.status(400).json({ errore: 'Portafoglio inesistente'});

    if (controllo.rows[0].archiviato === true)
      return res.status(409).json({ errore: 'Il portafoglio è archiviato' });

    const result = await pool.query(
      `INSERT INTO movimento (portafoglio_id, categoria_id, importo, data, descrizione)
      VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5)
      RETURNING id, portafoglio_id, categoria_id, importo, data::text as data, descrizione`,
      [portafoglio_id, categoria_id, importo, data ?? null, descrizione ?? null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23503')
      return res.status(400).json({ errore: 'Portafoglio o categoria inesistenti.' });
    if (error.code === '23514')
      return res.status(400).json({ errore: 'Dati non validi.' });
    if (error.code?.startsWith('22'))
      return res.status(400).json({ errore: 'Formato dei dati non valido.' });

    console.error('Errore nel creare il movimento: ', error);
    return res.status(500).json({ errore: 'Errore interno del server.' });
  }
});

// -------------- DELETE --------------

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `DELETE FROM movimento WHERE id = $1 RETURNING id`, [id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ errore: 'Movimento non trovato.' });

    res.status(204).send();

  } catch (error) {
    if (error.code?.startsWith('22'))
      return res.status(400).json({ errore: 'Tipo di dato non valido.' });

    console.error('Errore durante l\'eliminazione del movimento: ', error);
    return res.status(500).json({ errore: 'Errore interno del server.' });
  }
});



module.exports = router;