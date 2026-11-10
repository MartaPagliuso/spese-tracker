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

// -------------- POST --------------

router.post('/', async (req, res) => {
  const { portafoglio_origine_id, portafoglio_destinazione_id, importo, data, descrizione } = req.body ?? {};

  if ( portafoglio_origine_id == null || portafoglio_destinazione_id == null || importo == null)
    return res.status(400).json({ errore: 'Il portafoglio di origine e destinazione e l\'importo sono obbligatori' });

  const valore = Number(importo);
  
  if (!Number.isFinite(valore) || valore <= 0) {
    return res.status(400).json({ errore: 'L\'importo deve essere maggiore di 0' });
  }

  if ( String(portafoglio_destinazione_id) === String(portafoglio_origine_id) )
    return res.status(400).json({ errore: 'Il portafoglio di destinazione e di origine NON devono coincidere.' });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // blocca il portafoglio di origine
    const origine = await client.query(
      'SELECT id FROM portafoglio WHERE id = $1 FOR UPDATE', [portafoglio_origine_id]
    );

    if (origine.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ errore: 'Portafoglio di origine inesistente.' });
    }

    // controllo il saldo, confrontando direttamente in SQL
    const controllo = await client.query(
      'SELECT saldo >= $2::numeric AS sufficiente FROM saldo_portafoglio WHERE id = $1',
      [portafoglio_origine_id, importo]
    );

    if (!controllo.rows[0].sufficiente) {
      await client.query('ROLLBACK');
      return res.status(409).json({ errore: 'Il saldo non è sufficiente.' });
    }

    // la validazione è andata a buon fine, inserisco i dati nella tabella
    const result = await client.query(
      `INSERT INTO trasferimento (portafoglio_origine_id, portafoglio_destinazione_id, importo, data, descrizione)
      VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5)
      RETURNING id, portafoglio_origine_id, portafoglio_destinazione_id, importo, data::text as data, descrizione`,
      [portafoglio_origine_id, portafoglio_destinazione_id, importo, data ?? null, descrizione ?? null]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK');
    
    if (error.code === '23503')
      return res.status(400).json({ errore: 'Portafogli inesistenti' });

    if (error.code?.startsWith('22'))
      return res.status(400).json({ errore: 'Formato dei dati non valido.' });

    console.error('Errore nel creare il trasferimento: ', error);
    res.status(500).json({ errore: 'Errore interno del server' });
  } finally {
    client.release();
  }
});


module.exports = router;