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

console.log("REQ BODY:", req.body);
// ===== PDF =====
const doc = new jsPDF();

// ===== CONFIG =====
const amarelo = [212, 160, 23];
const cinza = 200;

let y = 15;

// ===== HEADER =====
doc.setFillColor(...amarelo);
doc.rect(0, 0, 210, 30, "F");

// LOGO
try{
const logoPath = path.join(__dirname, "icons", "icon-192.png");
if(fs.existsSync(logoPath)){
const logoBase64 = fs.readFileSync(logoPath, { encoding: "base64" });
const logo = `data:image/png;base64,${logoBase64}`;
doc.addImage(logo, "PNG", 15, 6, 16, 16);
}
}catch(e){}

// TEXTO HEADER
doc.setTextColor(0);
doc.setFontSize(13);
doc.text("GRUPO DE VIAGENS RF", 38, 13);

doc.setFontSize(8.5);
doc.text("CNPJ: 58.615.336/0001-49", 38, 18);
doc.text("Cabo de Santo Agostinho - PE", 38, 22);

// RECIBO
doc.setFontSize(12);
doc.text("RECIBO", 155, 13);

const numeroRecibo = Date.now().toString().slice(-6);
doc.setFontSize(9);
doc.text(`Nº ${numeroRecibo}`, 155, 18);

// ===== LINHA =====
y = 36;
doc.setDrawColor(cinza);
doc.line(15, y, 195, y);

y += 8;

// ===== DATA =====
doc.setFontSize(9);
doc.text(`Data: ${data}`, 15, y);
doc.text(`Hora: ${hora}`, 150, y);

y += 8;
doc.line(15, y, 195, y);

y += 10;

// ===== ITINERÁRIO =====
doc.setFontSize(11);
doc.setFont(undefined, "bold");
doc.text("ITINERÁRIO", 15, y);

doc.setFont(undefined, "normal");

y += 6;

doc.rect(15, y, 180, 32);

y += 7;

doc.setFontSize(9);

doc.text(`Origem: ${origem}`, 20, y); y+=5;
if(parada){ doc.text(`Parada: ${parada}`, 20, y); y+=5; }
doc.text(`Destino: ${destino}`, 20, y); y+=5;
doc.text(`Embarque: ${embarque || "-"}`, 20, y); y+=5;
doc.text(`Desembarque: ${desembarque || "-"}`, 20, y);

y += 12;

// ===== DETALHAMENTO =====
doc.setFont(undefined, "bold");
doc.setFontSize(11);
doc.text("DETALHAMENTO", 15, y);

doc.setFont(undefined, "normal");

y += 6;

// HEADER TABELA
doc.setFillColor(...amarelo);
doc.rect(15, y, 180, 7, "F");

doc.setFontSize(9);
doc.text("Descrição", 18, y + 5);
doc.text("Valor (R$)", 170, y + 5, { align: "right" });

y += 12;

// LINHAS
const linhas = (detalhes && typeof detalhes === "string") 
  ? detalhes.split("\n") 
  : [];

linhas.forEach(l => {

const partes = l.split(":");

const desc = partes[0] || "";
const val = (partes[1] || "").trim();

doc.text(desc, 18, y);
doc.text(val, 170, y, { align: "right" });

y += 5;

});

// linha final
y += 2;
doc.line(15, y, 195, y);

y += 10;

// ===== TOTAL =====
doc.setFillColor(...amarelo);
doc.rect(15, y, 180, 12, "F");

doc.setFontSize(14);
doc.setFont(undefined, "bold");

doc.text(`TOTAL: R$ ${total}`, 105, y + 8, { align: "center" });

doc.setFont(undefined, "normal");

y += 22;

// ===== ASSINATURA =====
doc.line(60, y, 150, y);

y += 5;

doc.setFontSize(9);
doc.text("Responsável pela operação", 105, y, { align: "center" });

y += 10;

// ===== RODAPÉ =====
doc.setFontSize(8);
doc.setTextColor(120);

doc.text(
"Documento gerado automaticamente - GRUPO RF",
105,
y,
{ align: "center" }
);
console.log("PDF GERADO OK");
  
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
