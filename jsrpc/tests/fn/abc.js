export default async (a, b, c = 1) => {
  console.log(a, b, c);
  return [a + b, c + a];
};

export const functionName = async function (a, b, c) {
  return a + b + c;
};

export const add = async (a, b) => {
    console.log(a - b);
  },
  rm = async (uid) => {
    return uid;
  },
  read = async (uid, id) => {
    if (id) {
      return uid;
    }
  },
  parse = async (uid, id) => {
    if (id > 0) {
      return uid;
    }
    return id;
  },
  star = async (uid, id) => {
    if (uid) {
      return id;
    }
    return id;
  };
