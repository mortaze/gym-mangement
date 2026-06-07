// pages/api/property-legal-enums.js
import PropertyLegalStatus from "../../../../backend/model/PropertyLegalStatus";

export default function handler(req, res) {
  try {
    const schema = PropertyLegalStatus.schema;

    res.status(200).json({
      legalStatus: schema.path("legalStatus").enumValues,
      officialDocumentType: schema.path("officialDocumentType").enumValues,
      ordinaryDocumentType: schema.path("ordinaryDocumentType").enumValues,
      definiteDocumentType: schema.path("definiteDocumentType").enumValues,
      noDocumentType: schema.path("noDocumentType").enumValues,
      transferMethod: schema.path("transferMethod").enumValues,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "مشکل در دریافت enum ها" });
  }
}
