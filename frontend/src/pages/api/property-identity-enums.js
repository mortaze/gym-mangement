// pages/api/property-identity-enums.js
import PropertyIdentity from "../../../../backend/model/PropertyIdentity";

export default function handler(req, res) {
  try {
    const schema = PropertyIdentity.schema;
    res.status(200).json({
      structureType: schema.path("structureType").enumValues,
      administrativeDivision: schema.path("administrativeDivision").enumValues,
      propertyType: schema.path("propertyType").enumValues,
      usageType: schema.path("usageType").enumValues,
      previousUsage: schema.path("previousUsage").enumValues,
    });
  } catch (err) {
    res.status(500).json({ error: "مشکل در دریافت enum ها" });
  }
}
