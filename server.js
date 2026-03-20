const express = require("express");
const cors = require("cors");
const { jsPDF } = require("jspdf");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// pasta pública
const pasta = path.join(__dirname, "public");
if (!fs.existsSync(pasta)) fs.mkdirSync(pasta);

app.use("/recibos", express.static(pasta));

// ===== ROTA GERAR PDF =====
app.post("/gerar-recibo", (req, res) => {

try{

const {
origem,
parada,
destino,
total,
detalhes,
data,
hora,
embarque,
desembarque,
motorista,
placa,
telefone,
cpf
} = req.body;

// ===== PDF =====
const doc = new jsPDF();

// ===== CONFIG VISUAL =====
const amarelo = [255, 180, 0];
const cinzaLinha = 220;

let y = 15;

// ===== HEADER =====
doc.setFillColor(...amarelo);
doc.rect(0, 0, 210, 32, "F");

// LOGO
try{
const logoPath = path.join(__dirname, "icons", "icon-192.png");
if(fs.existsSync(logoPath)){
const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
const logo = `data:image/png;base64,${logoBase64}`;
doc.addImage(logo, "PNG", 15, 6, 18, 18);
}
}catch(e){}

// TEXTO HEADER
doc.setTextColor(0);
doc.setFontSize(14);
doc.text("GRUPO DE VIAGENS RF", 40, 14);

doc.setFontSize(9);
doc.text("CNPJ: 58.615.336/0001-49", 40, 20);
doc.text("Cabo de Santo Agostinho - PE", 40, 25);

// RECIBO
doc.setFontSize(13);
doc.text("RECIBO", 155, 14);

const numeroRecibo = Date.now().toString().slice(-6);

doc.setFontSize(9);
doc.text(`Nº ${numeroRecibo}`, 155, 20);

// RESET POSIÇÃO
y = 40;

// ===== DATA =====
doc.setFontSize(9);
doc.text(`Data: ${data}`, 15, y);
doc.text(`Hora: ${hora}`, 150, y);

y += 6;
doc.setDrawColor(cinzaLinha);
doc.line(15, y, 195, y);

y += 10;

// ===== ITINERÁRIO =====
doc.setFontSize(11);
doc.text("ITINERÁRIO", 15, y);

y += 6;

doc.setDrawColor(cinzaLinha);
doc.rect(15, y, 180, 30);

y += 7;

doc.setFontSize(9);
doc.text(`Origem: ${origem}`, 20, y);
y += 5;

if(parada){
doc.text(`Parada: ${parada}`, 20, y);
y += 5;
}

doc.text(`Destino: ${destino}`, 20, y);
y += 5;

doc.text(`Embarque: ${embarque || "-"}`, 20, y);
y += 5;

doc.text(`Desembarque: ${desembarque || "-"}`, 20, y);

y += 15;

// ===== DETALHAMENTO =====
doc.setFontSize(11);
doc.text("DETALHAMENTO", 15, y);

y += 6;

// HEADER TABELA
doc.setFillColor(...amarelo);
doc.rect(15, y, 180, 8, "F");

doc.setFontSize(9);
doc.text("Descrição", 18, y + 5);
doc.text("Valor (R$)", 170, y + 5, { align: "right" });

y += 10;

// LINHAS
doc.setFontSize(9);

const linhas = detalhes ? detalhes.split("\n") : [];

linhas.forEach(l => {

const partes = l.split(":");

const desc = partes[0] || "";
const val = partes[1] || "";

doc.text(desc, 18, y);
doc.text(val.trim(), 170, y, { align: "right" });

y += 6;

});

// LINHA FINAL
doc.setDrawColor(cinzaLinha);
doc.line(15, y, 195, y);

y += 10;

// ===== MOTORISTA (CONDICIONAL) =====
if(motorista || placa || telefone || cpf){

doc.setFontSize(11);
doc.text("MOTORISTA", 15, y);

y += 6;

doc.rect(15, y, 180, 26);

y += 7;

doc.setFontSize(9);

if(motorista){
doc.text(`Nome: ${motorista}`, 20, y);
y += 5;
}

if(placa){
doc.text(`Placa: ${placa}`, 20, y);
y += 5;
}

if(telefone){
doc.text(`Telefone: ${telefone}`, 20, y);
y += 5;
}

if(cpf){
doc.text(`CPF: ${cpf}`, 20, y);
}

y += 10;
}

// ===== TOTAL =====
doc.setFillColor(...amarelo);
doc.rect(15, y, 180, 14, "F");

doc.setFontSize(16);
doc.text(`TOTAL: R$ ${total}`, 105, y + 9, { align: "center" });

y += 20;

// ===== RODAPÉ =====
doc.setFontSize(8);
doc.setTextColor(120);

doc.text(
"Documento gerado automaticamente - GRUPO RF",
105,
y,
{ align: "center" }
);

// ===== SALVAR PDF =====
const nome = `recibo_${Date.now()}.pdf`;
const caminho = path.join(pasta, nome);

const pdfBuffer = doc.output("arraybuffer");
fs.writeFileSync(caminho, Buffer.from(pdfBuffer));

// ===== LINK =====
const link = `https://backend-recibo-rf.onrender.com/recibos/${nome}`;

res.json({ link });

}catch(e){

console.error("Erro ao gerar PDF:", e);
res.status(500).json({ erro: "Erro ao gerar recibo" });

}

});

// ===== START =====
app.listen(3000, () => console.log("Servidor rodando"));
