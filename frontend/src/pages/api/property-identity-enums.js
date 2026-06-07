const enums = {
  structureType: ["ساختمان", "زمین", "عرصه", "اعیان"],
  administrativeDivision: ["شهری", "روستایی"],
  propertyType: ["مسکونی", "اداری", "تجاری", "آموزشی", "ورزشی", "سایر"],
  usageType: ["مسکونی", "اداری", "تجاری", "فرهنگی", "ورزشی", "سایر"],
  previousUsage: ["مسکونی", "اداری", "تجاری", "کشاورزی", "بایر", "سایر"],
};

export default function handler(req, res) {
  res.status(200).json(enums);
}
