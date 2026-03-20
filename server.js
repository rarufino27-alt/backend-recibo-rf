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

// ===== LOGO =====
let logo = null;
try{
const logoPath = path.join(__dirname, "icons", "icon-192.png");
if(fs.existsSync(logoPath)){
const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
logo = `data:image/png;base64,${logoBase64}`;
}
}catch(e){
console.log("Erro logo:", e);
}

// ===== CORES =====
const amarelo = [255, 193, 7];

// ===== HEADER =====
doc.setFillColor(...amarelo);
doc.rect(0, 0, 210, 35, "F");

// logo (se existir)
if(logo){
doc.addImage(logo, "PNG", 20, 8, 20, 20);
}

// texto header
doc.setTextColor(0, 0, 0);

doc.setFontSize(16);
doc.text("GRUPO DE VIAGENS RF", 50, 18);

doc.setFontSize(10);
doc.text("CNPJ: 58.615.336/0001-49", 50, 24);
doc.text("Cabo de Santo Agostinho - PE", 50, 30);

// recibo
doc.setFontSize(14);
doc.text("RECIBO", 160, 18);

const numeroRecibo = Date.now().toString().slice(-6);

doc.setFontSize(10);
doc.text(`Nº ${numeroRecibo}`, 160, 24);

// ===== CONTEÚDO =====
let y = 45;

// data
doc.setFontSize(10);
doc.text(`Data: ${data}`, 20, y);
doc.text(`Hora: ${hora}`, 120, y);

y += 10;

// ===== ITINERÁRIO =====
doc.setDrawColor(200);
doc.rect(20, y, 170, 35);

doc.setFontSize(12);
doc.text("ITINERÁRIO", 25, y + 6);

doc.setFontSize(10);

let yIt = y + 12;

doc.text(`Origem: ${origem}`, 25, yIt);
yIt += 6;

if(parada){
doc.text(`Parada: ${parada}`, 25, yIt);
yIt += 6;
}

doc.text(`Destino: ${destino}`, 25, yIt);
yIt += 6;

// horários
doc.text(`Embarque: ${embarque || "-"}`, 25, yIt);
yIt += 6;

doc.text(`Desembarque: ${desembarque || "-"}`, 25, yIt);

y += 45;

// ===== DETALHAMENTO =====
doc.setFontSize(12);
doc.text("DETALHAMENTO", 20, y);

y += 6;

// header tabela
doc.setFillColor(...amarelo);
doc.rect(20, y, 170, 8, "F");

doc.setFontSize(10);
doc.text("Descrição", 22, y + 5);
doc.text("Valor (R$)", 150, y + 5);

y += 10;

// linhas
const linhasDetalhes = detalhes ? detalhes.split("\n") : [];

linhasDetalhes.forEach(l => {

const partes = l.split(":");

const desc = partes[0] || "";
const val = partes[1] || "";

doc.text(desc, 22, y);
doc.text(val.trim(), 150, y);

y += 6;

});

// linha final
doc.line(20, y, 190, y);

y += 10;

// ===== MOTORISTA (CONDICIONAL) =====
if(motorista || placa || telefone || cpf){

doc.rect(20, y, 170, 30);

doc.setFontSize(12);
doc.text("MOTORISTA", 25, y + 6);

doc.setFontSize(10);

let yMot = y + 12;

if(motorista){
doc.text(`Nome: ${motorista}`, 25, yMot);
yMot += 6;
}

if(placa){
doc.text(`Placa: ${placa}`, 25, yMot);
yMot += 6;
}

if(telefone){
doc.text(`Telefone: ${telefone}`, 25, yMot);
yMot += 6;
}

if(cpf){
doc.text(`CPF: ${cpf}`, 25, yMot);
}

y += 40;

}

// ===== TOTAL =====
doc.setFillColor(...amarelo);
doc.rect(20, y, 170, 12, "F");

doc.setFontSize(14);
doc.text(`TOTAL: R$ ${total}`, 25, y + 8);

y += 20;

// ===== RODAPÉ =====
doc.setFontSize(9);
doc.setTextColor(120);

doc.text("Documento gerado automaticamente - RF Driver", 20, y);

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
