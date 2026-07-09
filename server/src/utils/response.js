/**
 * Consistent JSON response helpers.
 * Every endpoint uses one of these — never raw res.json().
 */

export const sendSuccess = (res, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, data });
};

export const sendError = (res, message, code = 'SERVER_ERROR', statusCode = 500, details = []) => {
  const body = { success: false, error: { code, message } };
  if (details.length) body.error.details = details;
  res.status(statusCode).json(body);
};
