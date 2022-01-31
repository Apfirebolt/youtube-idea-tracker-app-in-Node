const AWS = require("aws-sdk");

const s3 = new AWS.S3();

(async () => {
  await s3.putObject({
    Body: "Hello Frank",
    Bucket: "firebolt-file-uploads",
    Key: "dragon.txt",
  }).promise();
})();
