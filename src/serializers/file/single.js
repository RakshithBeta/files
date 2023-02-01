const pickKeysFromObject = requireUtil("pickKeysFromObject");
const AWS = require("aws-sdk");
const s3 = new AWS.S3({ signatureVersion: "v4" });

const setDownloadurl = (file) => {
  const myURL = new URL(file["path_to_file"]);

  let params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: myURL.pathname.slice(1),
    Expires: 600,
    ResponseContentDisposition:
      'attachment; filename ="' + file["file_name"] + '"',
  };

  const signedUrl = s3.getSignedUrl("getObject", params);

  file["download_url"] = signedUrl;

  return file;
};

const setImgixUrl = (file) => {
  const imgixUrl = process.env.IMGIX_URL;
  const pathURL = file["path_to_file"];
  if (imgixUrl && typeof imgixUrl === "string") {
    file["imgix_url"] = imgixUrl.concat(
      pathURL.slice(pathURL.lastIndexOf("/") + 1, pathURL.length)
    );
  }
  return file;
};

module.exports = async (instance, includes = []) => {
  instance = setDownloadurl(instance);
  instance = setImgixUrl(instance);

  const attributes = [
    "uuid",
    "mime",
    "file_name",
    "path_to_file",
    "owner_service",
    "owner_identifier",
    "meta",
    "created_at",
    "updated_at",
    "download_url",
    "imgix_url",
  ];
  const tokenObject = pickKeysFromObject(instance, attributes);
  return tokenObject;
};
