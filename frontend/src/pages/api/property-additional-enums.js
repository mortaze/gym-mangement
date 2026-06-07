// pages/api/property-additional-enums.js
import PropertyAdditionalInfo from "../../../../backend/model/PropertyAdditionalInfo";

export default async function handler(req, res) {
  try {
    const schema = PropertyAdditionalInfo.schema.paths;

    const enums = {};

    // بررسی تمام فیلدها و استخراج enum ها
    Object.keys(schema).forEach((key) => {
      const path = schema[key];
      if (path?.enumValues?.length > 0) {
        enums[key] = path.enumValues;
      }
    });

    // اگر بخوای فیلدهای nested مثل utilities رو هم دستی اضافه کنی
    // ولی معمولاً enum داخل utilities نداریم
    res.status(200).json(enums);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "مشکل در دریافت enum ها" });
  }
}
