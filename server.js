const doc = new jsPDF();

// ===== LOGO =====
const logoPath = path.join(__dirname, "icons/icon-192.png");
const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
const logo = `data:image/png;base64,${logoBase64}`;

doc.addImage(logo, "PNG", 20, 10, 25, 25);

// ===== CABEÇALHO =====
doc.setFontSize(16);
doc.text("GRUPO DE VIAGENS RF", 50, 18);

doc.setFontSize(10);
doc.text("CNPJ: 58.615.336/0001-49", 50, 24);
doc.text("Cabo de Santo Agostinho - PE", 50, 30);

// ===== RECIBO =====
doc.setFontSize(14);
doc.text("RECIBO", 150, 18);

const numeroRecibo = Date.now().toString().slice(-6);
doc.setFontSize(10);
doc.text(`Nº ${numeroRecibo}`, 150, 24);

// ===== LINHA =====
doc.line(20, 38, 190, 38);

// ===== DATA =====
doc.setFontSize(10);
doc.text(`Data: ${data}`, 20, 45);
doc.text(`Hora: ${hora}`, 120, 45);

// ===== ITINERÁRIO =====
let y = 55;

doc.setFontSize(12);
doc.text("ITINERÁRIO", 20, y);
y += 8;

doc.setFontSize(10);

doc.text(`Origem: ${origem}`, 20, y);
y += 6;

if (parada) {
  doc.text(`Parada: ${parada}`, 20, y);
  y += 6;
}

doc.text(`Destino: ${destino}`, 20, y);
y += 10;

// ===== DETALHAMENTO =====
doc.setFontSize(12);
doc.text("DETALHAMENTO", 20, y);
y += 8;

doc.setFontSize(10);

// Quebra de linha segura
const linhasDetalhes = detalhes ? detalhes.split("\n") : [];

linhasDetalhes.forEach(l => {
  doc.text(l, 20, y);
  y += 6;
});

// ===== MOTORISTA =====
y += 5;

doc.setFontSize(12);
doc.text("MOTORISTA", 20, y);
y += 8;

doc.setFontSize(10);

doc.text(`Nome: ${motorista || "-"}`, 20, y);
y += 6;

doc.text(`Placa: ${placa || "-"}`, 20, y);
y += 6;

doc.text(`Telefone: ${telefone || "-"}`, 20, y);
y += 6;

doc.text(`CPF: ${cpf || "-"}`, 20, y);

y += 10;

// ===== TOTAL DESTACADO =====
doc.setFontSize(14);
doc.text(`TOTAL: R$ ${total}`, 20, y);

// ===== RODAPÉ =====
y += 15;

doc.setFontSize(9);
doc.text("Documento gerado automaticamente pelo sistema RF Driver", 20, y);
