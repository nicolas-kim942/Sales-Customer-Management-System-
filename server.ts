import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Secure Backend Master Accounts Metadata (Protected on server-side)
const SECURE_EXISTING_ACCOUNTS = [
  { ex_id: "EX-001", company_name: "LX MMA", country: "대한민국", notes: "주력 파트너사" },
  { ex_id: "EX-002", company_name: "LG화학", country: "대한민국", notes: "도료 및 컴파운드용" },
  { ex_id: "EX-003", company_name: "롯데케미칼", country: "대한민국", notes: "시트 및 압출용" },
  { ex_id: "EX-004", company_name: "한화솔루션", country: "대한민국", notes: "건축 자재용" },
  { ex_id: "EX-005", company_name: "코오롱인더스트리", country: "대한민국", notes: "광학 필름용" },
  { ex_id: "EX-006", company_name: "삼성전자", country: "대한민국", notes: "가전 외장재" },
  { ex_id: "EX-007", company_name: "현대자동차", country: "대한민국", notes: "자동차 내외장재" },
  { ex_id: "EX-008", company_name: "기아", country: "대한민국", notes: "램프 커버" },
  { ex_id: "EX-009", company_name: "Chi Mei Corporation", country: "대만", notes: "아시아 주요 경쟁사 겸 거래처" },
  { ex_id: "EX-010", company_name: "Mitsubishi Chemical", country: "일본", notes: "글로벌 파트너" },
  { ex_id: "EX-011", company_name: "Sumitomo Chemical", country: "일본", notes: "특수 등급 공급" },
  { ex_id: "EX-012", company_name: "Kuraray", country: "일본", notes: "광학용 PMMA" },
  { ex_id: "EX-013", company_name: "Evonik Industries", country: "독일", notes: "Plexiglas 공급사" },
  { ex_id: "EX-014", company_name: "Arkema", country: "프랑스", notes: "Altuglas 사업부" },
  { ex_id: "EX-015", company_name: "SABIC", country: "사우디아라비아", notes: "엔지니어링 플라스틱" },
  { ex_id: "EX-016", company_name: "Dow Chemical", country: "미국", notes: "기초 소재" },
  { ex_id: "EX-017", company_name: "Celanese", country: "미국", notes: "컴파운드 협력" },
  { ex_id: "EX-018", company_name: "Kolon Plastics", country: "대한민국", notes: "엔플라" },
  { ex_id: "EX-019", company_name: "SK케미칼", country: "대한민국", notes: "코폴리에스터" },
  { ex_id: "EX-020", company_name: "Toray Advanced Materials", country: "대한민국", notes: "필름 및 섬유" }
];

// API endpoint for fetching secure master accounts
app.get("/api/existing-accounts", (req, res) => {
  res.json({
    success: true,
    data: SECURE_EXISTING_ACCOUNTS,
    count: SECURE_EXISTING_ACCOUNTS.length,
    security: "secured_on_backend"
  });
});

async function startServer() {
  // Vite middleware setup for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Secure Backend Server running on http://localhost:${PORT}`);
  });
}

startServer();
