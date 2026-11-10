INSERT INTO utente (nome) VALUES ('Utente test');

INSERT INTO portafoglio (utente_id, nome)
SELECT u.id, p.nome
FROM utente u,
    (VALUES ('Conto corrente'), ('Contanti'), ('Risparmi')) AS p(nome)
WHERE u.nome = 'Utente test';

INSERT INTO categoria (nome, tipo) VALUES
  ('Stipendio', 'entrata'),
  ('Rimborsi',  'entrata'),
  ('Affitto',   'uscita'),
  ('Cibo',      'uscita'),
  ('Trasporti', 'uscita'),
  ('Svago',     'uscita');

INSERT INTO movimento (portafoglio_id, categoria_id, importo, data, descrizione)
SELECT p.id, c.id, v.importo, v.data::date, v.descrizione
FROM (VALUES
  ('Conto corrente', 'Stipendio', 'entrata', 1800.00, '2026-11-01', 'Stipendio di novembre'),
  ('Conto corrente', 'Affitto',   'uscita',   650.00, '2026-11-02', 'Affitto novembre'),
  ('Conto corrente', 'Cibo',      'uscita',    62.40, '2026-11-03', 'Spesa settimanale'),
  ('Conto corrente', 'Trasporti', 'uscita',    35.00, '2026-11-05', 'Abbonamento mezzi'),
  ('Conto corrente', 'Rimborsi',  'entrata',   45.50, '2026-11-06', 'Rimborso spese'),
  ('Contanti',       'Cibo',      'uscita',    18.30, '2026-11-04', 'Pranzo fuori'),
  ('Contanti',       'Svago',     'uscita',    25.00, '2026-11-07', 'Cinema')
) AS v(portafoglio, categoria, tipo, importo, data, descrizione)
JOIN portafoglio p ON p.nome = v.portafoglio
JOIN categoria c ON c.nome = v.categoria AND c.tipo = v.tipo;

INSERT INTO trasferimento (portafoglio_origine_id, portafoglio_destinazione_id, importo, data, descrizione)
SELECT o.id, d.id, v.importo, v.data::date, v.descrizione
FROM (VALUES
  ('Conto corrente', 'Risparmi', 200.00, '2026-11-02', 'Quota risparmio'),
  ('Conto corrente', 'Contanti', 100.00, '2026-11-03', 'Prelievo')
) AS v(origine, destinazione, importo, data, descrizione)
JOIN portafoglio o ON o.nome = v.origine
JOIN portafoglio d ON d.nome = v.destinazione;