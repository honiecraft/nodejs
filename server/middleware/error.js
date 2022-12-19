exports.createError = (statusNo, message) => {
  const err = new Error();
  err.status = statusNo;
  err.message = message;
  return err;
};
