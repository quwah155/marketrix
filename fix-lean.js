const fs = require("fs");
const path = require("path");

const dirs = ["services", "server", "lib", "app"];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf8");

      const before = content;
      // Replace .lean() optionally followed by a space, but NOT followed by ' as'
      content = content.replace(/\.lean\(\)(?!\s*as)/g, ".lean() as any");
      content = content.replace(
        /\.lean\(\{ virtuals: true \}\)(?!\s*as)/g,
        ".lean({ virtuals: true }) as any",
      );

      if (before !== content) {
        fs.writeFileSync(fullPath, content, "utf8");
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

dirs.forEach((d) => {
  const target = path.join(__dirname, d);
  if (fs.existsSync(target)) {
    processDir(target);
  }
});
