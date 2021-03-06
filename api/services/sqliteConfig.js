const nodeDiskInfo = require("node-disk-info");
const path = require("path");
const fs = require("fs");
var sqlite3 = require("sqlite3").verbose();

var dbPath;
var db;


// Fetch Disk Info Asynchronusly
// nodeDiskInfo
//   .getDiskInfo()
//   .then((disks) => {
//     printResults("ASYNC WAY", disks);
//   })
//   .catch((reason) => {
//     console.error(reason);
//   });

// Sync way
try {
  const disks = nodeDiskInfo.getDiskInfoSync();
  dbPath = findDBPath(disks);
} catch (e) {
  console.error(e);
}

function findDBPath(disks) {
  var dbFilePath = path.join(__dirname, "../../neodb.db");
  disks.map((disk) => {
    if (disk.filesystem === "Removable Disk") {
      dbFilePath = `${disk.mounted}\\accounts\\data\\neodb.db`;
    }
  });
  return dbFilePath;
}

console.log(dbPath);

try {
  if (fs.existsSync(dbPath)) {
    db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log(`connected to data : ${dbPath}`);
    });
  } else {
    console.log("data location not found !");
  }
} catch (err) {
  console.error(err);
}

module.exports = db;
