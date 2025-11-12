const sortHandler = (sort, order) => {
  let newSort;

  if (typeof sort === "string") {
    newSort = { [sort]: order };
  } else {
    newSort = sort.reduceRight((acc, key) => ({ [key]: acc }), order);
  }

  return newSort;
};

module.exports = sortHandler;
