function normalizeSize(value) {
  return value
    .trim()
    .replace(/[\u201C\u201D\u2033]/g, '"') // semua kutip fancy → "
    .replace(/\s*,\s*/g, ",") // spasi di sekitar koma
    .replace(/\s+/g, " ") // spasi ganda
    .toLowerCase();
}

const findDuplicateItems = (items) => {
  const seen = new Set();
  const duplicates = [];

  items.forEach((item, index) => {
    const key = JSON.stringify({
      size: normalizeSize(item.size),
      quantity: item.quantity,
      measurementUnit: item.measurementUnit,
      basePrice: item.basePrice,
      specialPrice: item.specialPrice,
    });

    if (seen.has(key)) {
      duplicates.push({ index, item });
    } else {
      seen.add(key);
    }
  });

  return duplicates;
};

module.exports = findDuplicateItems;
