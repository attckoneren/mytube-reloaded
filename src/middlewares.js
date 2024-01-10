import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.AWS_SECRET,
  },
});

const multerUploader = multerS3({
  s3: s3,
  bucket: "mytubee",
  acl: "public-read",
});

export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "Mytube";
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user || {};
  next();
};

export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Please log in");
    return res.redirect("/login");
  }
};

export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Please log out");
    return res.redirect("/");
  }
};

export const uploadFileMiddleware = multer({
  dest: "uploads/avatars",
  limits: {
    fileSize: 3000000,
  },
  storage: multerUploader,
});
export const uploadVideoMiddleware = multer({
  dest: "uploads/videos",
  limits: {
    fileSize: 100000000,
  },
  storage: multerUploader,
});

export const deleteSuccess = (req, res, next) => {
  req.flash("success", "Done deleting comments");
  next();
};
