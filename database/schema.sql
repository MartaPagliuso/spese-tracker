CREATE TABLE utente (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, 
  nome TEXT NOT NULL 
);

CREATE TABLE portafoglio (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT NOT NULL, 
  utente_id BIGINT GENERATED ALWAYS AS PRIMARY KEY,
  archiviato BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(nome, utente_id)
);

CREATE TABLE categoria (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrata', 'uscita')),
  UNIQUE(nome, tipo)
);

CREATE TABLE movimento (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  portafoglio_id BIGINT NOT NULL REFERENCES portafoglio(id) ON DELETE RESTRICT,
  categoria_id BIGINT NOT NULL REFERENCES categoria(id) ON DELETE RESTRICT,
  importo NUMERIC(12,2) NOT NULL CHECK (importo > 0),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  descrizione TEXT
);

CREATE TABLE trasferimento (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  portafoglio_origine_id BIGINT NOT NULL REFERENCES portafoglio(id) ON DELETE RESTRICT,
  portafoglio_destinazione_id BIGINT NOT NULL REFERENCES portafoglio(id) ON DELETE RESTRICT,
  importo NUMERIC(12,2) NOT NULL CHECK (importo > 0),
  data DATE NOT NULL DEFAULT CURRENT_DATE,
  descrizione TEXT,
  CHECK(portafoglio_origine_id <> portafoglio_destinazione_id)
);