// middleware/uploadDonationImage.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloud/cloudinary");

const donationStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "donation_images",
    allowed_formats: ["jpg", "jpeg", "png"],
  },
});

const donationParser = multer({ storage: donationStorage });

module.exports = donationParser;
