const enums = {
  securityCouncilApproved: ["بله", "خیر", "در حال بررسی"],
  securityLevel: ["کم", "متوسط", "زیاد", "خیلی زیاد"],
  environmentValue: ["کم", "متوسط", "زیاد", "ویژه"],
};

export default function handler(req, res) {
  res.status(200).json(enums);
}
