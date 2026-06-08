require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const connectDB = require("../config/db");
const User = require("../model/User");
const Membership = require("../model/Membership");
const { expireMemberships } = require("../utils/membership");

(async () => {
  await connectDB();
  const users = await User.find({ height: { $gt: 0 }, weight: { $gt: 0 } });
  for (const user of users) {
    await user.save(); // model pre-validate safely recalculates BMI only from existing values
  }
  await Membership.updateMany(
    { status: { $exists: false } },
    { $set: { status: "Pending Payment", completedSessions: 0 } },
  );
  await expireMemberships();
  console.log(`Backfilled BMI for ${users.length} users and normalized memberships.`);
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
