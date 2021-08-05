export const getId = element => element["_"]["#"];

export const getUUID = gun => gun.opt()._.opt.uuid();

export const getPub = id => {
  let match;
  if ((match = /^~([^@].*)$/.exec(id))) {
    return match[1];
  } else if ((match = /^(.*)~(.*)\.$/.exec(id))) {
    return match[2];
  }
};
