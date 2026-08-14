const fs = require('fs');
const readline = require('readline');

const ARQUIVO_ESTOQUE = './estoque.json';

// Carrega as motos salvas no arquivo JSON
function carregarEstoque() {
  if (!fs.existsSync(ARQUIVO_ESTOQUE)) {
    fs.writeFileSync(ARQUIVO_ESTOQUE, JSON.stringify([]));
  }
  const conteudo = fs.readFileSync(ARQUIVO_ESTOQUE, 'utf-8');
  return JSON.parse(conteudo || '[]');
}

// Salva as motos no arquivo JSON
function salvarEstoque(motos) {
  fs.writeFileSync(ARQUIVO_ESTOQUE, JSON.stringify(motos, null, 2));
}

// Gera o relatório formatado para o WhatsApp
function gerarRelatorio() {
  const motos = carregarEstoque();
  
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const anoAtual = hoje.getFullYear();
  const dataFormatada = `${dia}/${mes}/${anoAtual}`;

  let marcasAnos = {};
  let totalEstoque = 0;

  let disponiveisSerie = { 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
  let totalDisponiveis = 0;

  let manutencao = {};
  let preparacao = {};
  let detran = {};
  let observacoes = {};

  motos.forEach(m => {
    // Exibe o ano resumido (ex: 2026 -> 26)
    let anoAbrav = m.ano.length === 4 ? m.ano.substring(2) : m.ano;
    const chaveMarcaAno = `${m.marca.toUpperCase()} ${anoAbrav}`;
    
    marcasAnos[chaveMarcaAno] = (marcasAnos[chaveMarcaAno] || 0) + 1;
    totalEstoque++;

    const st = m.status.toUpperCase();
    const det = m.detalhes ? m.detalhes.toUpperCase() : 'SEM DETALHE';

    if (st === 'DISPONIVEL') {
      const s = m.serie ? m.serie.toUpperCase() : '';
      if (disponiveisSerie.hasOwnProperty(s)) {
        disponiveisSerie[s]++;
      }
      totalDisponiveis++;
    } 
    else if (st === 'MANUTENCAO') {
      const chave = `${m.marca.toUpperCase()} ${m.ano} ${det}`;
      manutencao[chave] = (manutencao[chave] || 0) + 1;
    } 
    else if (st === 'PREPARACAO') {
      const chave = `${m.marca.toUpperCase()} ${m.ano} ${det}`;
      preparacao[chave] = (preparacao[chave] || 0) + 1;
    } 
    else if (st === 'DETRAN') {
      const chave = `${m.marca.toUpperCase()} ${m.ano} ${det}`;
      detran[chave] = (detran[chave] || 0) + 1;
    } 
    else if (st === 'OBSERVACAO') {
      const chave = `${m.marca.toUpperCase()} ${m.ano} ${det}`;
      observacoes[chave] = (observacoes[chave] || 0) + 1;
    }
  });

  // Montagem da mensagem
  let msg = `*RELATÓRIO DE MOTOS EM ESTOQUE ZEH MOTOCA-JP* 🏍️📈\n`;
  msg += `📆 ${dataFormatada}\n`;

  for (let key in marcasAnos) {
    msg += `     - ${key}: ${marcasAnos[key]}\n`;
  }
  msg += `TOTAL-------------- ${totalEstoque} 🛵\n\n`;

  msg += `*TOTAL DE VÉICULOS DISPONÍVEIS: ${totalDisponiveis} MOTOS DISPONÍVEIS* 🏍️✅\n`;
  msg += `SÉRIE 🅰️: ${disponiveisSerie['A']}\n`;
  msg += `SÉRIE 🅱️: ${disponiveisSerie['B']}\n`;
  msg += `SÉRIE ©️: ${disponiveisSerie['C']}\n`;
  msg += `SÉRIE D : ${disponiveisSerie['D']}\n\n`;

  msg += `*TOTAL DE MOTOS EM MANUTENÇÃO* 👨🏼‍🔧\n\n`;
  for (let key in manutencao) {
    msg += `${key} - ${manutencao[key]}\n`;
  }
  msg += `\n`;

  msg += `*_MOTOS EM PREPARAÇÃO SALÃO_* 👨🏼‍🔧\n\n`;
  for (let key in preparacao) {
    msg += `${key} - ${preparacao[key]}\n`;
  }
  msg += `\n`;

  msg += `*MOTOS SEVIÇO DETRAN/ PLACA*\n\n`;
  for (let key in detran) {
    msg += `${key} - ${detran[key]}\n`;
  }
  msg += `\n`;

  msg += `⚠️ *OBSERVAÇÕES* ⚠️\n\n`;
  for (let key in observacoes) {
    msg += `${key} - ${observacoes[key]}\n`;
  }

  return msg;
}

// Menu interativo no Terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function exibirMenu() {
  console.log('\n--- 🏍️ ZEH MOTOCA AUTOMAÇÃO JS ---');
  console.log('1. 📱 Gerar Relatório Formatado');
  console.log('2. ➕ Adicionar Moto');
  console.log('3. ❌ Remover Moto (por ID/Placa)');
  console.log('4. 🔄 Mudar Status de uma Moto');
  console.log('5. 🚪 Sair');

  rl.question('\nEscolha uma opção: ', (opcao) => {
    switch (opcao.trim()) {
      case '1':
        console.log('\n================ COPIE ABAIXO ================\n');
        console.log(gerarRelatorio());
        console.log('==============================================\n');
        exibirMenu();
        break;

      case '2':
        rl.question('ID/Placa: ', (id) => {
          rl.question('Marca (HONDA/YAMAHA): ', (marca) => {
            rl.question('Ano (ex: 2025): ', (ano) => {
              rl.question('Status (DISPONIVEL, MANUTENCAO, PREPARACAO, DETRAN, OBSERVACAO): ', (status) => {
                rl.question('Série (A, B, C, D ou Vazio): ', (serie) => {
                  rl.question('Detalhes/Observação (ou Vazio): ', (detalhes) => {
                    const motos = carregarEstoque();
                    motos.push({ id, marca, ano, serie, status, detalhes });
                    salvarEstoque(motos);
                    console.log('✅ Moto adicionada com sucesso!');
                    exibirMenu();
                  });
                });
              });
            });
          });
        });
        break;

      case '3':
        rl.question('Digite o ID/Placa da moto para remover: ', (idRemover) => {
          let motos = carregarEstoque();
          const tamanhoAntes = motos.length;
          motos = motos.filter(m => m.id !== idRemover);
          if (motos.length < tamanhoAntes) {
            salvarEstoque(motos);
            console.log('✅ Moto removida com sucesso!');
          } else {
            console.log('❌ Moto não encontrada.');
          }
          exibirMenu();
        });
        break;

      case '4':
        rl.question('Digite o ID/Placa da moto para alterar: ', (idMudar) => {
          let motos = carregarEstoque();
          let moto = motos.find(m => m.id === idMudar);
          if (moto) {
            rl.question('Novo Status (DISPONIVEL, MANUTENCAO, PREPARACAO, DETRAN, OBSERVACAO): ', (novoStatus) => {
              rl.question('Nova Série (A, B, C, D ou Vazio): ', (novaSerie) => {
                rl.question('Novos Detalhes: ', (novosDetalhes) => {
                  moto.status = novoStatus;
                  moto.serie = novaSerie;
                  moto.detalhes = novosDetalhes;
                  salvarEstoque(motos);
                  console.log('✅ Status atualizado!');
                  exibirMenu();
                });
              });
            });
          } else {
            console.log('❌ Moto não encontrada.');
            exibirMenu();
          }
        });
        break;

      case '5':
        rl.close();
        break;

      default:
        console.log('Opção inválida!');
        exibirMenu();
    }
  });
}

exibirMenu();
