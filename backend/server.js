require('dotenv').config();

const express = require('express');
const portafogliRouter = require('./routes/portafogli');
const movimentiRouter = require('./routes/movimenti');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/portafogli', portafogliRouter);
app.use('/api/movimenti', movimentiRouter);

app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
});