export default (name, li) => {
  name = JSON.stringify(name);
  const signed = [];

  li.forEach(
    ([
      fn,
      [
        arg0,
        //  , ...args
      ],
    ]) => {
      if (arg0 == "uid") {
        signed.push(fn);
      }
    },
  );
  return "load(" + name + ",new Set(" + JSON.stringify(signed) + "))";
};
