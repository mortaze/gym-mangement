import PropertyOwnership from "../../../../backend/model/PropertyOwnership";

export default async function handler(req, res) {
  // استخراج enumها از مدل
  const ownershipStatus =
    PropertyOwnership.schema.path("ownershipStatus").enumValues;
  const ownerType = PropertyOwnership.schema.path("ownerType").enumValues;
  const dispute = PropertyOwnership.schema.path("dispute").enumValues;
  const ownershipConfirmedStatus = PropertyOwnership.schema.path(
    "ownershipConfirmedStatus"
  ).enumValues;
  const possessorType =
    PropertyOwnership.schema.path("possessorType").enumValues;
  const possessionReason =
    PropertyOwnership.schema.path("possessionReason").enumValues;
  const disputeParty = PropertyOwnership.schema.path("disputeParty").enumValues;

  res.status(200).json({
    ownershipStatus,
    ownerType,
    ownershipConfirmedStatus,
    possessorType,
    possessionReason,
    dispute,
    disputeParty,
  });
}
