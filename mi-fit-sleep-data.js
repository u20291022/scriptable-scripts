// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// always-run-in-app: true; icon-color: cyan;
// icon-glyph: moon;

const sql = importModule('sql');
const widget = new ListWidget();

const localFiles = FileManager.local();
const documentsPath = localFiles.documentsDirectory();
const dbFile = localFiles.joinPath(documentsPath, "database.db");

async function runQuery() {
    const SQL = await sql.initSqlJs();
    const filebuffer = localFiles.read(dbFile).getBytes();
    const db = new SQL.Database(filebuffer);
    const result = db.exec("select time, value from sleep_day order by time desc limit 1");
    // Include a timestamp with the result
    const payload = { timestamp: Date.now(), result };
    const jsonFile = localFiles.joinPath(documentsPath, "sleep_result.json");
    localFiles.writeString(jsonFile, JSON.stringify(payload));
    return payload;
}

if (!config.runsInWidget) {
    const dbPath = (await DocumentPicker.open())[0];
    console.log(dbPath)
    const dbData = localFiles.read(dbPath);
    localFiles.write(dbFile, dbData);
    const payload = await runQuery();
    console.log("DB query executed and updated");
} else {
    const jsonFile = localFiles.joinPath(documentsPath, "sleep_result.json");
    let payload;
    try {
        payload = JSON.parse(localFiles.readString(jsonFile));
    } catch (e) {
        payload = null;
    }
    // If no valid payload or older than one hour, re-run the query.
    if (!payload || (Date.now() - payload.timestamp) >= 3600 * 1000) {
        payload = await runQuery();
    }

    const values = payload.result[0].values[0];
    const data = JSON.parse(values[1]);
    const awakeCount = data.awake_count;
    const sleepScore = data.sleep_score;
    const lightSleepDuration = data.sleep_light_duration;
    const deepSleepDuration = data.sleep_deep_duration;
    const remSleepDuration = data.sleep_rem_duration;
    const totalSleep = lightSleepDuration + deepSleepDuration + remSleepDuration;

    widget.setPadding(0, 0, 0, 0);
    
    const totalHours = Math.floor(totalSleep / 60);
    const totalMinutes = totalSleep % 60;
    const formattedSleep = `${totalHours}:${totalMinutes < 10 ? "0" : ""}${totalMinutes}h`;
    const totalText = widget.addText(`Total Sleep: ${formattedSleep}`);
    totalText.font = Font.systemFont(14);
    totalText.textColor = Color.black();
    totalText.centerAlignText();
    
    widget.addSpacer(5);
    
    const scoreText = widget.addText(`Sleep Score: ${sleepScore}`);
    scoreText.font = Font.systemFont(14);
    scoreText.textColor = Color.black();
    scoreText.centerAlignText();
    
    widget.addSpacer(5);
    
    const awakeText = widget.addText(`Awake Count: ${awakeCount}`);
    awakeText.font = Font.systemFont(14);
    awakeText.textColor = Color.black();
    awakeText.centerAlignText();
    
    widget.refreshAfterDate = new Date(Date.now() + 3600 * 1000);
}

Script.setWidget(widget);
Script.complete();