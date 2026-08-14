const fs = require('fs');
const path = require('path');
const { clipboard } = require('electron');

const caminhoEstoque = path.join(__dirname, 'estoque.json');

function carregarEstoque() {
  if (!fs.existsSync(caminhoEstoque)) return [];
  return JSON.parse(fs.readFileSync(caminhoEstoque, 'utf-8') || '[]');
}

function gerarRelatorio() {
  const motos = carregarEstoque();
  
  const hoje = new Date();
  const dataFormatada = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

  let marcasAnos = {};
  let totalEstoque = 0;
  let disponiveisSerie = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
  let totalDisponiveis = 0;

  let manutencao = {}, preparacao = {}, detran = {}, observacoes = {};

  motos.forEach(m => {
    let anoAbrav = m.ano.length === 4 ? m.ano.substring(2) : m.ano;
    const chaveMarcaAno = `${m.marca.toUpperCase()} ${anoAbrav}`;
    marcasAnos[chaveMarcaAno] = (marcasAnos[chaveMarcaAno] || 0) + 1;
    totalEstoque++;

    const st = m.status.toUpperCase();
    const det = m.detalhes ? m.detalhes.toUpperCase() : 'SEM DETALHE';

    if (st === 'DISPONIVEL') {
      const s = m.serie ? m.serie.toUpperCase() : '';
      if (disponiveisSerie.hasOwnProperty(s)) disponiveisSerie[s]++;
      totalDisponiveis++;
    } else if (st === 'MANUTENCAO') {
      const k = `${m.marca.toUpperCase()} ${m.ano} ${det}`;
      manutencao[k] = (manutencao[k] || 0) + 1;
    } else if (st === 'PREPARACAO') {
      const k = `${m.marca.toUpperCase()} ${m.ano} ${det}`;
      preparacao[k] = (preparacao[k] || 0) + 1;
    } else if (st === 'DETRAN') {
      const k = `${m.marca.toUpperCase()} ${m.ano} ${det}`;
      detran[k] = (detran[k] || 0) + 1;
    } else if (st === 'OBSERVACAO') {
      const k = `${m.marca.toUpperCase()} ${m.ano} ${det}`;
      observacoes[k] = (observacoes[k] || 0) + 1;
    }
  });

  let msg = `*RELATÓRIO DE MOTOS EM ESTOQUE ZEH MOTOCA-JP* 🏍️📈\n`;
  msg += `📆 ${dataFormatada}\n`;

  for (let key in marcasAnos) msg += `     - ${key}: ${marcasAnos[key]}\n`;
  msg += `TOTAL-------------- ${totalEstoque} 🛵\n\n`;

  msg += `*TOTAL DE VÉICULOS DISPONÍVEIS: ${totalDisponiveis} MOTOS DISPONÍVEIS* 🏍️✅\n`;
  msg += `SÉRIE 🅰️: ${disponiveisSerie['A']}\nSÉRIE 🅱️: ${disponiveisSerie['B']}\nSÉRIE ©️: ${disponiveisSerie['C']}\nSÉRIE D : ${disponiveisSerie['D']}\n\n`;

  msg += `*TOTAL DE MOTOS EM MANUTENÇÃO* 👨🏼‍🔧\n\n`;
  for (let key in manutencao) msg += `${key} - ${manutencao[key]}\n`;
  msg += `\n*_MOTOS EM PREPARAÇÃO SALÃO_* 👨🏼‍🔧\n\n`;
  for (let key in preparacao) msg += `${key} - ${preparacao[key]}\n`;
  msg += `\n*MOTOS SEVIÇO DETRAN/ PLACA*\n\n`;
  for (let key in detran) msg += `${key} - ${detran[key]}\n`;
  msg += `\n⚠️ *OBSERVAÇÕES* ⚠️\n\n`;
  for (let key in observacoes) msg += `${key} - ${observacoes[key]}\n`;

  document.getElementById('relatorioTxt').value = msg;
  document.getElementById('statusMsg').innerText = "Relatório atualizado com sucesso!";
}

function copiarTexto() {
  const texto = document.getElementById('relatorioTxt').value;
  if (!texto) return;
  clipboard.writeText(texto);
  document.getElementById('statusMsg').innerText = "✅ Relatório copiado! Só colar no WhatsApp (Ctrl + V).";
}

// Gera o relatório assim que o app abre
window.onload = gerarRelatorio;
