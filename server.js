'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');
const { main: runGenerator } = require('./generator');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';
const OUT_DIR = path.join(__dirname, 'generated');

// Ensure generated catalog exists on startup
if (!fs.existsSync(path.join(OUT_DIR, 'catalogo-digital.html'))) {
  try {
    console.log('Gerando arquivos do catálogo inicial...');
    runGenerator();
  } catch (err) {
    console.error('Falha ao gerar catálogo na inicialização:', err.message);
  }
}

// Serve static assets from generated folder and root
app.use(express.static(OUT_DIR));
app.use(express.static(__dirname));

// Primary entry point: digital catalog HTML
app.get('/', (req, res) => {
  const htmlFile = path.join(OUT_DIR, 'catalogo-digital.html');
  if (fs.existsSync(htmlFile)) {
    return res.sendFile(htmlFile);
  }
  const rootHtml = path.join(__dirname, 'index.html');
  if (fs.existsSync(rootHtml)) {
    return res.sendFile(rootHtml);
  }
  res.status(404).send('Catálogo não encontrado. Execute npm run generate.');
});

// JSON API endpoint for products and catalog
app.get('/api/catalog', (req, res) => {
  const jsonFile = path.join(OUT_DIR, 'catalog-api.json');
  if (fs.existsSync(jsonFile)) {
    return res.sendFile(jsonFile);
  }
  const rawDataFile = path.join(__dirname, 'catalog-data.json');
  if (fs.existsSync(rawDataFile)) {
    return res.sendFile(rawDataFile);
  }
  res.status(404).json({ error: 'Catalog data not found' });
});

// Markdown consolidated catalog endpoint
app.get('/api/markdown', (req, res) => {
  const mdFile = path.join(OUT_DIR, 'catalogo-consolidado.md');
  if (fs.existsSync(mdFile)) {
    res.type('text/markdown');
    return res.sendFile(mdFile);
  }
  res.status(404).send('Markdown catalog not found');
});

// Endpoint to trigger regeneration
app.post('/api/regenerate', async (req, res) => {
  try {
    const result = await runGenerator();
    res.json({
      success: true,
      message: 'Catálogo gerado com sucesso!',
      total: result.total,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, HOST, () => {
  console.log(`Catálogo Centralizado rodando em http://${HOST}:${PORT}`);
});
