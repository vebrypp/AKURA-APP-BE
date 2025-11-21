const prisma = require("../../../../config/prismaClient");
const staffRelations = require("./staffRelations");

const relationCheck = async (staff) => {
  if (!staff) return false;

  const staffIds = Array.isArray(staff) ? staff.map((s) => s.id) : [staff.id];

  const checks = staffRelations.map((rel) => {
    return prisma[rel.model].count({
      where: { [rel.field]: { in: staffIds } },
    });
  });

  const results = await Promise.all(checks);

  return results.some((count) => count > 0);
};

module.exports = relationCheck;
