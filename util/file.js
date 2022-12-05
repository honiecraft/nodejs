const cloudinary = require("cloudinary").v2;
const DatauriParser = require("datauri/parser");

const deleteFile = (filePath) => {
  const imgPathArr = filePath.split("/");
  const imgPath = imgPathArr[imgPathArr.length - 1].split(".")[0];
  cloudinary.uploader.destroy(imgPath, (err) => {
    if (err) {
      throw err;
    }
  });
};

const uploadImage = (image) => {
  const parser = new DatauriParser();
  const fileFormat = image.mimetype.split("/")[1];
  const { base64 } = parser.format(fileFormat, image.buffer);

  return cloudinary.uploader.upload(
    `data:image/${fileFormat};base64,${base64}`,
    (err) => {
      if (err) {
        throw err;
      }
    }
  );
};

exports.deleteFile = deleteFile;
exports.uploadImage = uploadImage;
