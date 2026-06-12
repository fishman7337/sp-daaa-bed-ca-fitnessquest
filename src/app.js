const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");

const apiRoutes = require("./modules/apiRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const { env } = require("./config/env");

const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "data:"],
        "media-src": ["'self'"],
        "connect-src": ["'self'"],
        "font-src": ["'self'", "data:"],
        "object-src": ["'none'"],
        "upgrade-insecure-requests": env.NODE_ENV === "production" ? [] : null,
      },
    },
  }),
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: env.NODE_ENV === "test" ? 1000 : 300,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "fitnessquest" });
});

app.use("/api", apiRoutes);
app.use("/", apiRoutes.legacyRouter);
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(notFound);
app.use(errorHandler);

module.exports = app;
