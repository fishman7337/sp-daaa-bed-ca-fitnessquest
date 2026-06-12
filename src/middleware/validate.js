const { createError } = require("../utils/httpError");

function validate(schemas) {
  return (req, res, next) => {
    for (const target of ["params", "query", "body"]) {
      if (!schemas[target]) {
        continue;
      }

      const parsed = schemas[target].safeParse(req[target]);
      if (!parsed.success) {
        return next(
          createError(400, "Invalid request data", {
            details: parsed.error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          }),
        );
      }
      req[target] = parsed.data;
    }

    return next();
  };
}

module.exports = {
  validate,
};
