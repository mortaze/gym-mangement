const enums = {
  caseStatus: ["جاری", "مختومه", "در انتظار بررسی"],
};

export default function handler(req, res) {
  res.status(200).json(enums);
}
