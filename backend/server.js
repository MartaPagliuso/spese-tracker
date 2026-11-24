require('dotenv').config();

const express = require('express');
const path = require('path');

const portafogliRouter = require('./routes/portafogli');
const movimentiRouter = require('./routes/movimenti');
const categorieRouter = require('./routes/categorie');
const trasferimentiRouter = require('./routes/trasferimenti');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/portafogli', portafogliRouter);
app.use('/api/movimenti', movimentiRouter);
app.use('/api/categorie', categorieRouter);
app.use('/api/trasferimenti', trasferimentiRouter);

app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});