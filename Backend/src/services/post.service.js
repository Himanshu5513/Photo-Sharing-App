const imgKit = require("@imagekit/nodejs");

const imgkit = new imgKit({
  privateKey: process.env.PRIVATE_KEY,
});

async function upload(buffer) {
  const response = await imgkit.files.upload({
    file: buffer.toString("base64"),
    fileName: "img.jpg",
  });
  return response;
}

module.exports = upload;
