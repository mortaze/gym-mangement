const enums = {
  legalStatus: ["سند رسمی", "سند عادی", "فاقد سند", "در جریان ثبت"],
  officialDocumentType: ["تک برگ", "دفترچه‌ای", "بنچاق", "سایر"],
  ordinaryDocumentType: ["قولنامه", "مبایعه نامه", "صلح نامه", "سایر"],
  definiteDocumentType: ["قطعی", "وکالتی", "صلح", "سایر"],
  noDocumentType: ["تصرفی", "وقفی", "فاقد مدرک", "سایر"],
  transferMethod: ["خرید", "واگذاری", "صلح", "وقف", "ارث", "سایر"],
};

export default function handler(req, res) {
  res.status(200).json(enums);
}
