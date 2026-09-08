import { ExistingAccount, PotentialAccount } from '../types';

export const INITIAL_EXISTING_ACCOUNTS: ExistingAccount[] = [
  { ex_id: 'EX-001', company_name: 'LX MMA', country: '대한민국', notes: '주력 파트너사' },
  { ex_id: 'EX-002', company_name: 'LG화학', country: '대한민국', notes: '도료 및 컴파운드용' },
  { ex_id: 'EX-003', company_name: '롯데케미칼', country: '대한민국', notes: '시트 및 압출용' },
  { ex_id: 'EX-004', company_name: '한화솔루션', country: '대한민국', notes: '건축 자재용' },
  { ex_id: 'EX-005', company_name: '코오롱인더스트리', country: '대한민국', notes: '광학 필름용' },
  { ex_id: 'EX-006', company_name: '삼성전자', country: '대한민국', notes: '가전 외장재' },
  { ex_id: 'EX-007', company_name: '현대자동차', country: '대한민국', notes: '자동차 내외장재' },
  { ex_id: 'EX-008', company_name: '기아', country: '대한민국', notes: '램프 커버' },
  { ex_id: 'EX-009', company_name: 'Chi Mei Corporation', country: '대만', notes: '아시아 주요 경쟁사 겸 거래처' },
  { ex_id: 'EX-010', company_name: 'Mitsubishi Chemical', country: '일본', notes: '글로벌 파트너' },
  { ex_id: 'EX-011', company_name: 'Sumitomo Chemical', country: '일본', notes: '특수 등급 공급' },
  { ex_id: 'EX-012', company_name: 'Kuraray', country: '일본', notes: '광학용 PMMA' },
  { ex_id: 'EX-013', company_name: 'Evonik Industries', country: '독일', notes: 'Plexiglas 공급사' },
  { ex_id: 'EX-014', company_name: 'Arkema', country: '프랑스', notes: 'Altuglas 사업부' },
  { ex_id: 'EX-015', company_name: 'SABIC', country: '사우디아라비아', notes: '엔지니어링 플라스틱' },
  { ex_id: 'EX-016', company_name: 'Dow Chemical', country: '미국', notes: '기초 소재' },
  { ex_id: 'EX-017', company_name: 'Celanese', country: '미국', notes: '컴파운드 협력' },
  { ex_id: 'EX-018', company_name: 'Kolon Plastics', country: '대한민국', notes: '엔플라' },
  { ex_id: 'EX-019', company_name: 'SK케미칼', country: '대한민국', notes: '코폴리에스터' },
  { ex_id: 'EX-020', company_name: 'Toray Advanced Materials', country: '대한민국', notes: '필름 및 섬유' },
];

export const INITIAL_POTENTIAL_ACCOUNTS: PotentialAccount[] = [
  // Exact existing matches
  { account_id: 'ACC-001', company_name: 'LX MMA', country: '대한민국', application: '자동차 부품', contact_email: 'contact@lxmma-test.co.kr', contact_person: '김영수 부장', phone: '02-555-0101' },
  { account_id: 'ACC-002', company_name: 'LG화학', country: '대한민국', application: '도료/코팅', contact_email: 'procurement@lgchem.com', contact_person: '이민호 팀장', phone: '02-3773-1114' },
  { account_id: 'ACC-003', company_name: '롯데케미칼', country: '대한민국', application: '압출 시트', contact_email: 'lotte.chem@lotte.net', contact_person: '박준호 과장', phone: '02-829-4114' },
  { account_id: 'ACC-004', company_name: 'Evonik Industries', country: '독일', application: '조명/광학', contact_email: 'info@evonik.de', contact_person: 'Hans Weber', phone: '+49-201-177-0' },
  { account_id: 'ACC-005', company_name: 'Mitsubishi Chemical', country: '일본', application: '디스플레이 도광판', contact_email: 'mcc.contact@m-kagaku.co.jp', contact_person: 'Kenji Sato', phone: '+81-3-6748-7111' },

  // Spelling discrepancies
  { account_id: 'ACC-006', company_name: 'LXMMA', country: '대한민국', application: '사출 성형', contact_email: 'sales@lxmma.com', contact_person: '최진우 대리', phone: '02-555-0199' },
  { account_id: 'ACC-007', company_name: 'LG Chemical Ltd.', country: '대한민국', application: '광학 필름', contact_email: 'global@lgchem.co.kr', contact_person: 'Sarah Kang', phone: '02-3773-9999' },
  { account_id: 'ACC-008', company_name: 'Evonik AG', country: '독일', application: '자동차 램프', contact_email: 'contact@evonik.com', contact_person: 'Markus Braun', phone: '+49-201-177-500' },
  { account_id: 'ACC-009', company_name: 'Kuraray Co., Ltd.', country: '일본', application: '특수 광학렌즈', contact_email: 'info@kuraray.co.jp', contact_person: 'Tanaka Hiroshi', phone: '+81-3-6701-1000' },
  { account_id: 'ACC-010', company_name: 'Arkema S.A.', country: '프랑스', application: '간판 및 건자재', contact_email: 'contact@arkema.fr', contact_person: 'Pierre Dupont', phone: '+33-1-49-00-80-80' },

  // Pure new targets (미거래 타겟)
  { account_id: 'ACC-011', company_name: 'Global Optronics Corp', country: '미국', application: '태양광 패널 커버', contact_email: 'inquiry@globaloptronics.com', contact_person: 'John Smith', phone: '+1-408-555-0143' },
  { account_id: 'ACC-012', company_name: 'Nihon Acrylic Tech', country: '일본', application: '수조 및 아크릴 가구', contact_email: 'order@nihon-acryl.co.jp', contact_person: 'Yamamoto Ken', phone: '+81-6-6202-0011' },
  { account_id: 'ACC-013', company_name: 'Shenzhen Bright Display', country: '중국', application: 'LED 백라이트 유닛', contact_email: 'sales@szbrightdisplay.cn', contact_person: 'Wang Wei', phone: '+86-755-8833-2211' },
  { account_id: 'ACC-014', company_name: 'Vietnam Plastics & PMMA Co', country: '베트남', application: '간판 및 디스플레이', contact_email: 'contact@vnplastics.vn', contact_person: 'Nguyen Van Minh', phone: '+84-28-3822-1234' },
  { account_id: 'ACC-015', company_name: 'Bangkok Acrylic Innovations', country: '태국', application: '자동차 내장재', contact_email: 'info@bangkokacryl.th', contact_person: 'Somchai Prasert', phone: '+66-2-234-5678' },
  { account_id: 'ACC-016', company_name: 'AeroLens Technologies', country: '미국', application: '항공기 창문', contact_email: 'aerolens@aerotech.us', contact_person: 'David Miller', phone: '+1-206-555-8899' },
  { account_id: 'ACC-017', company_name: 'Nordic Polymer Solutions', country: '스웨덴', application: '건축용 채광판', contact_email: 'hej@nordicpolymer.se', contact_person: 'Astrid Lindgren', phone: '+46-8-123-4567' },
  { account_id: 'ACC-018', company_name: 'Seoul Signage & Display', country: '대한민국', application: '광고용 아크릴 판넬', contact_email: 'seoul@signage.co.kr', contact_person: '오민수 대표', phone: '02-777-8899' },
  { account_id: 'ACC-019', company_name: 'PanaDisplay Taiwan', country: '대만', application: 'TV 프레임', contact_email: 'service@panadisplay.tw', contact_person: 'Lin Chia-Hao', phone: '+886-2-2700-1122' },
  { account_id: 'ACC-020', company_name: 'Munich Precision Optics', country: '독일', application: '의료용 광학기기', contact_email: 'contact@munich-optics.de', contact_person: 'Greta Schmidt', phone: '+49-89-2311-00' },

  // Duplicates for testing duplicate detection
  { account_id: 'ACC-021', company_name: 'Global Optronics Corp', country: '미국', application: '태양광 패널 커버', contact_email: 'duplicate@globaloptronics.com', contact_person: 'John Smith (Alt)', phone: '+1-408-555-0199' },
  { account_id: 'ACC-022', company_name: 'Seoul Signage & Display', country: '대한민국', application: '광고용 아크릴 판넬', contact_email: 'alt@signage.co.kr', contact_person: '오민수 대표', phone: '02-777-8899' },

  // Error cases (missing company_name or missing required fields)
  { account_id: 'ACC-023', company_name: '', country: '대한민국', application: '미분류', contact_email: 'error1@test.com', contact_person: '무명', phone: '02-000-0000' },
  { account_id: 'ACC-024', company_name: '   ', country: '베트남', application: '불명', contact_email: 'error2@test.com', contact_person: '무명', phone: '+84-00-0000' },
  { account_id: 'ACC-025', company_name: 'Incheon Chemical Lab', country: '', application: '연구용', contact_email: 'incheon@lab.co.kr', contact_person: '박연구', phone: '032-111-2222' }
];
