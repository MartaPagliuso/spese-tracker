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

// -------------- POST --------------

router.post('/', async (req, res) => {
  const { nome, tipo } = req.body ?? {};

  if (typeof nome !== 'string' || typeof tipo !== 'string')
    return res.status(400).json({ errore: 'Il nome e il tipo sono obbligatori.' });

  const nomePulito = nome.trim();
  const tipoPulito = tipo.trim();

  if (nomePulito === '')
    return res.status(400).json({ errore: 'Il nome non può essere vuoto' });

  if (!['entrata', 'uscita'].includes(tipoPulito))
    return res.status(400).json({ errore: 'Tipo inserito non valido.' });

  try {
    const result = await pool.query(
      `INSERT INTO categoria (nome, tipo)
      VALUES ($1, $2)
      RETURNING id, nome, tipo`,
      [nomePulito, tipoPulito]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505')
      return res.status(409).json({ errore: 'Categoria già esistente.' });

    console.error('Errore nella creazione della categoria: ', error);
    return res.status(500).json({ errore: 'Errore interno del server.' });
  }
});

module.exports = router;