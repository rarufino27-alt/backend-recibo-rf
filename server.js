const doc = new jsPDF();

// ===== LOGO =====
const logoPath = path.join(__dirname, "icons/icon-192.png");
const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
const logo = `data:image/png;base64,${logoBase64}`;

doc.addImage(logo, "PNG", 20, 10, 20, 20);

// ===== CORES =====
const amarelo = [255, 193, 7];

// ===== HEADER FUNDO =====
doc.setFillColor(...amarelo);
doc.rect(0, 0, 210, 35, "F");

// ===== TEXTO HEADER =====
doc.setTextColor(0, 0, 0);
doc.setFontSize(16);
doc.text("GRUPO DE VIAGENS RF", 50, 18);

doc.setFontSize(10);
doc.text("CNPJ: 58.615.336/0001-49", 50, 24);
doc.text("Cabo de Santo Agostinho - PE", 50, 30);

// ===== RECIBO =====
doc.setFontSize(14);
doc.text("RECIBO", 160, 18);

const numeroRecibo = Date.now().toString().slice(-6);
doc.setFontSize(10);
doc.text(`Nº ${numeroRecibo}`, 160, 24);

// ===== RESET COR =====
doc.setTextColor(0, 0, 0);

let y = 45;

// ===== DATA =====
doc.setFontSize(10);
doc.text(`Data: ${data}`, 20, y);
doc.text(`Hora: ${hora}`, 120, y);

y += 10;

// ===== BOX ITINERÁRIO =====
doc.setDrawColor(200);
doc.rect(20, y, 170, 25);

doc.setFontSize(12);
doc.text("ITINERÁRIO", 25, y + 6);

doc.setFontSize(10);

let yIt = y + 12;

doc.text(`Origem: ${origem}`, 25, yIt);
yIt += 6;

if (parada) {
  doc.text(`Parada: ${parada}`, 25, yIt);
  yIt += 6;
}

doc.text(`Destino: ${destino}`, 25, yIt);

y += 35;

// ===== DETALHAMENTO TABELA =====
doc.setFontSize(12);
doc.text("DETALHAMENTO", 20, y);

y += 6;

// cabeçalho tabela
doc.setFillColor(...amarelo);
doc.rect(20, y, 170, 8, "F");

doc.setFontSize(10);
doc.text("Descrição", 22, y + 5);
doc.text("Valor (R$)", 150, y + 5);

y += 10;

// linhas
doc.setFontSize(10);

const linhasDetalhes = detalhes ? detalhes.split("\n") : [];

linhasDetalhes.forEach(l => {

  const partes = l.split(":");

  const desc = partes[0] || "";
  const val = partes[1] || "";

  doc.text(desc, 22, y);
  doc.text(val.trim(), 150, y);

  y += 6;
});

// ===== LINHA FINAL =====
doc.line(20, y, 190, y);

y += 10;

// ===== MOTORISTA BOX =====
doc.rect(20, y, 170, 30);

doc.setFontSize(12);
doc.text("MOTORISTA", 25, y + 6);

doc.setFontSize(10);

doc.text(`Nome: ${motorista || "-"}`, 25, y + 12);
doc.text(`Placa: ${placa || "-"}`, 25, y + 18);
doc.text(`Telefone: ${telefone || "-"}`, 25, y + 24);
doc.text(`CPF: ${cpf || "-"}`, 110, y + 12);

y += 40;

// ===== TOTAL DESTACADO =====
doc.setFillColor(...amarelo);
doc.rect(20, y, 170, 12, "F");

doc.setFontSize(14);
doc.text(`TOTAL: R$ ${total}`, 25, y + 8);

y += 20;

// ===== RODAPÉ =====
doc.setFontSize(9);
doc.setTextColor(120);

doc.text("Documento gerado automaticamente - RF Driver", 20, y);
