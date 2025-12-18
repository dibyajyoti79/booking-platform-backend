const fs = require("fs");
const path = require("path");

// Copy proto files from src/proto to dist/proto
const srcProtoDir = path.join(process.cwd(), "src/proto");
const distProtoDir = path.join(process.cwd(), "dist/proto");

// Create dist/proto directory if it doesn't exist
if (!fs.existsSync(distProtoDir)) {
  fs.mkdirSync(distProtoDir, { recursive: true });
}

// Copy all .proto files
const files = fs.readdirSync(srcProtoDir);
files.forEach((file) => {
  if (file.endsWith(".proto")) {
    const srcFile = path.join(srcProtoDir, file);
    const distFile = path.join(distProtoDir, file);
    fs.copyFileSync(srcFile, distFile);
    console.log(`Copied ${file} to dist/proto/`);
  }
});

console.log("Proto files copied successfully!");

