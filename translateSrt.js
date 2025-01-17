const fs = require("fs");
const path = require("path");
const translate = require("google-translate-api-x");
const cliProgress = require("cli-progress");

(async () => {
  try {
    // Read your SRT file
    const inputFilePath = path.join(__dirname, "audio.srt");
    const outputFilePath = path.join(__dirname, "audio_translated.srt");

    const data = fs.readFileSync(inputFilePath, "utf-8");
    const lines = data.split("\n");
    const translatedLines = [];

    // Set up the progress bar
    const progressBar = new cliProgress.SingleBar(
      {
        format: "Translating |{bar}| {value}/{total} lines",
      },
      cliProgress.Presets.shades_classic
    );

    // Start the bar at 0 with the total set to the number of lines
    progressBar.start(lines.length, 0);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (
        trimmedLine.match(/^\d+$/) ||
        trimmedLine.includes("-->") ||
        trimmedLine === ""
      ) {
        // If it's an index line, timing line, or empty line, just keep it
        translatedLines.push(line);
      } else {
        // Attempt to translate the line
        try {
          const res = await translate(trimmedLine, { from: "auto", to: "en" });
          translatedLines.push(res.text);
        } catch (err) {
          console.error("Translation error:", err);
          // Fall back to original text if there's an error
          translatedLines.push(line);
        }
      }

      // Update progress
      progressBar.update(i + 1);
    }

    // Stop the progress bar
    progressBar.stop();

    // Write out the translated file
    fs.writeFileSync(outputFilePath, translatedLines.join("\n"), "utf-8");
    console.log("Translation complete:", outputFilePath);
  } catch (err) {
    console.error("Error:", err);
  }
})();
