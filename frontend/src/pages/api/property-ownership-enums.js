const enums = {
  ownershipStatus: ["طلق", "مشاع", "وقفی", "رهنی", "سایر"],
  ownerType: ["جمعیت", "حقیقی", "حقوقی", "دولتی", "سایر"],
  ownershipConfirmedStatus: ["تثبیت شده", "در حال بررسی", "نامشخص"],
  possessorType: ["جمعیت", "حقیقی", "حقوقی", "دولتی", "سایر"],
  possessionReason: ["معارض دارد", "تصرف قانونی", "واگذاری", "اجاره", "سایر"],
  dispute: ["دارد", "ندارد", "نامشخص"],
  disputeParty: ["اداره اوقاف و امور خیریه", "شهرداری", "اشخاص حقیقی", "اشخاص حقوقی", "سایر"],
};

export default function handler(req, res) {
  res.status(200).json(enums);
}
