export const DEMO_BASE_MS = Date.parse("2026-04-15T00:00:00.000Z");

export const initialCompanies = [
  { id: "synercore", name: "Synercore", desc: "Primary", accent: "purple" },
  { id: "sy3", name: "SY3 Energy", desc: "Energy Services", accent: "cyan" },
  { id: "kes", name: "KES Prime", desc: "Engineering", accent: "amber" },
  { id: "gen3", name: "Gen3 Toll Packing", desc: "Packaging", accent: "magenta" },
  { id: "philweld", name: "Philweld", desc: "Manufacturing", accent: "green" },
  { id: "gemotra", name: "Gemotra", desc: "Electrical Services", accent: "orange" },
];

export const demoData = {
  synercore: {
    id: "req-2025-001",
    prNo: "PR-2025-1024",
    status: "FOR_GM_SELECTION",
    dueAt: new Date(DEMO_BASE_MS + 2 * 864e5).toISOString(),
    blockedReason: null,
    nextActor: "GM - Supplier Selection",
    updatedAt: new Date(DEMO_BASE_MS - 6 * 36e5).toISOString(),
  },
  sy3: {
    id: "req-2025-002",
    prNo: "PR-2025-1025",
    status: "APPROVED_FOR_PO",
    dueAt: new Date(DEMO_BASE_MS + 5 * 36e5).toISOString(),
    blockedReason: null,
    nextActor: "Procurement - Create PO",
    updatedAt: new Date(DEMO_BASE_MS - 3 * 36e5).toISOString(),
  },
  kes: {
    id: "req-2025-003",
    prNo: "PR-2025-1026",
    status: "FOR_DEPT_HEAD_APPROVAL",
    dueAt: new Date(DEMO_BASE_MS - 4 * 36e5).toISOString(),
    blockedReason: null,
    nextActor: "Dept Head - Review & Approve",
    updatedAt: new Date(DEMO_BASE_MS - 12 * 36e5).toISOString(),
  },
  gen3: {
    id: "req-2025-004",
    prNo: "PR-2025-1027",
    status: "DELIVERY_SCHEDULED",
    dueAt: null,
    blockedReason: "DELIVERY_TERMS_NEGOTIATION",
    nextActor: "Supplier - Confirm Terms",
    updatedAt: new Date(DEMO_BASE_MS - 2 * 864e5).toISOString(),
  },
  philweld: {
    id: "req-2025-005",
    prNo: "PR-2025-1028",
    status: "PO_CREATED",
    dueAt: new Date(DEMO_BASE_MS + 8 * 36e5).toISOString(),
    blockedReason: null,
    nextActor: "Supplier - Acknowledge Receipt",
    updatedAt: new Date(DEMO_BASE_MS - 1 * 36e5).toISOString(),
  },
  gemotra: {
    id: "req-2025-006",
    prNo: "PR-2025-1029",
    status: "COSTING_INPUTTED",
    dueAt: new Date(DEMO_BASE_MS + 12 * 36e5).toISOString(),
    blockedReason: null,
    nextActor: "GM - Supplier Selection",
    updatedAt: new Date(DEMO_BASE_MS - 5 * 36e5).toISOString(),
  },
};
