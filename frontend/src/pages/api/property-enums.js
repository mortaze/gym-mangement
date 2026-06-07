// pages/api/property-enums.js
import PropertyBasicStatus from "../../../../backend/model/PropertyStatus";

export default async function handler(req, res) {
  try {
    // گرفتن enum از مدل Mongoose
    const caseStatusEnum =
      PropertyBasicStatus.schema.path("caseStatus").enumValues;
    res.status(200).json({ caseStatus: caseStatusEnum });
  } catch (err) {
    res.status(500).json({ error: "مشکل در دریافت enum ها" });
  }
}
