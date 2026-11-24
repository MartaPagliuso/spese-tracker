const elenco = document.getElementById('elenco-portafogli');
const messaggio = document.getElementById('messaggio');

const formatoEuro = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });

function formattaImporto(testo) {
  return formatoEuro.format(Number(testo));
}

async function caricaPortafogli() {
  messaggio.textContent = 'Caricamento...';

  try {
    const risposta = await fetch('/api/portafogli');

    if (!risposta.ok) {
      messaggio.textContent = 'Impossibile caricare il portafogli';
      return;
    }

    const portafogli = await risposta.json();
    
    for (const p of portafogli) {
      const li = document.createElement('li');

      const nome = document.createElement('span');
      nome.textContent = p.portafoglio;

      const saldo = document.createElement('span');
      saldo.textContent = formattaImporto(p.saldo);
      if (Number(p.saldo) < 0) saldo.classList.add('negativo');

      li.append(nome, saldo);
      elenco.append(li);
    }
  } catch (error) {
    console.error(error);
    messaggio.textContent = 'Errore di rete: il server non risponde.';
  }
}

caricaPortafogli();