const csv = require("csv-parser");
const fs = require("fs");

function parseRegions(results) {
  // take unique region data to use for our region/municipality tree
  const data = results.map((x) => ({
    key: x["KUNTANRO"],
    name: {
      fi: x["KUNTANIMIFI"],
      sv: x["KUNTANIMISV"],
    },
  }));
  return data;
}

function parse(done) {
  const results = [];

  fs.createReadStream("municipalities.csv")
    .pipe(
      csv({
        separator: ";",
      })
    )
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {
      const municipalities = parseRegions(results);
      console.log("parsed municipalities", municipalities.length);

      done(municipalities);
    });
}

function writeJson(data) {
  const json = JSON.stringify(data, null, 4);
  fs.writeFile("municipalities.json", json, (err) => {
    if (err) {
      throw err;
    }

    console.log("wrote municipalities.json");
  });
}

parse((data) => {
  writeJson(data);
});
