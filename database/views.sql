CREATE VIEW saldo_portafoglio AS
WITH variazioni AS (
  SELECT
    m.portafoglio_id AS portafoglio_id,
    CASE
      WHEN c.tipo = 'entrata' THEN m.importo
      WHEN c.tipo = 'uscita'  THEN -m.importo
    END AS variazione
  FROM movimento m
  JOIN categoria c ON c.id = m.categoria_id
  UNION ALL
  SELECT portafoglio_origine_id, -importo FROM trasferimento
  UNION ALL
  SELECT portafoglio_destinazione_id, importo FROM trasferimento
)
SELECT
  p.id,
  p.nome AS portafoglio,
  COALESCE(SUM(v.variazione), 0) AS saldo
FROM portafoglio p
LEFT JOIN variazioni v ON v.portafoglio_id = p.id
GROUP BY p.id, p.nome;