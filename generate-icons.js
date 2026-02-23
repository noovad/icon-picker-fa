const fs = require("fs");
const path = require("path");

const BASE_DIR = path.join(__dirname, "svgs");
const OUTPUT_FILE = path.join(__dirname, "icons.json");

function removeComments(svg) {
  return svg.replace(/<!--[\s\S]*?-->/g, "");
}

function extractViewBox(svg) {
  const match = svg.match(/viewBox="([^"]+)"/);
  return match ? match[1] : "0 0 512 512";
}

function extractPaths(svg) {
  const paths = [];
  const regex = /<path[^>]*d="([^"]+)"[^>]*>/g;

  let match;
  while ((match = regex.exec(svg)) !== null) {
    paths.push(match[1]);
  }

  return paths;
}

function scanCategory(categoryPath, categoryName) {
  const files = fs.readdirSync(categoryPath);
  const icons = [];

  files.forEach((file) => {
    if (file.endsWith(".svg")) {
      const filePath = path.join(categoryPath, file);
      let svgContent = fs.readFileSync(filePath, "utf8");

      svgContent = removeComments(svgContent);

      icons.push({
        name: file.replace(".svg", ""),
        category: categoryName,
        viewBox: extractViewBox(svgContent),
        paths: extractPaths(svgContent),
      });
    }
  });

  return icons;
}

function generate() {
  const categories = fs.readdirSync(BASE_DIR);
  const result = {};

  categories.forEach((category) => {
    const categoryPath = path.join(BASE_DIR, category);
    if (fs.statSync(categoryPath).isDirectory()) {
      result[category] = scanCategory(categoryPath, category);
    }
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));
  console.log("icons.json generated (clean version).");
}

generate();