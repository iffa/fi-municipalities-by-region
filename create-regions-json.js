const csv = require("csv-parser");
const uniqueBy = require("unique-by");
const fs = require("fs");

function parseRegions(results) {
  // take unique region data to use for our region/municipality tree
  const data = results.map((x) => ({
    key: x["MAAKUNTANRO"],
    name: {
      fi: x["MAAKUNTANIMIFI"],
      sv: x["MAAKUNTANIMISV"],
    },
    elements: [],
  }));
  return uniqueBy(data, "key");
}

function populateWithMunicipalities(data, regions) {
  // add municipality to corresponding region
  data.forEach((x) => {
    regions
      .find((region) => region.key === x["MAAKUNTANRO"])
      .elements.push({
        key: x["KUNTANRO"],
        name: {
          fi: x["KUNTANIMIFI"],
          sv: x["KUNTANIMISV"],
        },
      });
  });

  return regions;
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
      const regions = parseRegions(results);
      console.log("parsed regions", regions.length);

      const populated = populateWithMunicipalities(results, regions);
      console.log(
        "populated regions with municipalities",
        populated.map((x) => x.elements.length).reduce((a, b) => a + b, 0)
      );

      done(populated);
    });
}

function writeJson(data) {
  const json = JSON.stringify(data, null, 4);
  fs.writeFile("regions.json", json, (err) => {
    if (err) {
      throw err;
    }

    console.log("wrote regions.json");
  });
}

parse((data) => {
  writeJson(data);
});
