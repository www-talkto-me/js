export default (name, li) => {
  const signed = [];
  for (const [fn, [arg0]] of li) {
    if (arg0 === "uid") {
      signed.push(fn);
    }
  }
  return `load(${JSON.stringify(name)},new Set(${JSON.stringify(signed)}))`;
};
