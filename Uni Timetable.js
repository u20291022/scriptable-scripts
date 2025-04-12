// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: calendar-alt;
const groupsApiUri = "https://u20291022.me/timetable-api/group";
const timetableApiUri = "https://u20291022.me/timetable-api/getGroupSchedule/"; // /group_id
const defaultGroupId = 6479;

let groupId = defaultGroupId;

const groupName = args.widgetParameter;
if (groupName) {
    const groupsRequest = new Request(groupsApiUri);
    const allGroups = await groupsRequest.loadJSON();
    let bestMatch = allGroups.find(group => group.toLowerCase() === groupName.toLowerCase());
    if (!bestMatch) {
        bestMatch = allGroups.find(group => group.toLowerCase().includes(groupName.toLowerCase()));
    }
    if (bestMatch) {
        groupId = bestMatch;
    }
}

const timetableRequest = new Request(timetableApiUri + groupId);
const timetableData = await timetableRequest.loadJSON();
const currentMonthIndex = new Date().getMonth();
const currentDay = new Date().getDate();
const currentHour = new Date().getHours();
const currentMinutes = new Date().getMinutes();
const nextLesson = timetableData.filter(lesson => {
    const monthIndex = lesson.date.monthIndex;
    const day = lesson.date.day;
    const isNewYear = monthIndex < currentMonthIndex;
    const isToday = monthIndex === currentMonthIndex && day === currentDay;
    const monthIndexValid = monthIndex >= currentMonthIndex;
    const dayValid = day > currentDay;
    const dateValid = monthIndexValid && dayValid; 
    const lessonStartTimeString = lesson.lessonTime.start;
    const [startHours, startMinutes] = lessonStartTimeString.split(".").map(Number);
    const hoursValid = startHours >= currentHour;
    const minutesValid = startMinutes > currentMinutes;
    const timeValid = isToday && hoursValid && minutesValid;
    return !isNewYear && (dateValid || timeValid);
})[0];

let textForWidget = "There is no lessons in future"
if (nextLesson) {
    const lessonStartTimeString = nextLesson.lessonTime.start;
    const [hours, minutes] = lessonStartTimeString.split(".").map(Number);

    // idk what is this. coded by copilot
    const now = new Date();
    const lessonDate = new Date(now.getFullYear(), nextLesson.date.monthIndex, nextLesson.date.day, hours, minutes, 0);
    if (lessonDate < now) {
        lessonDate.setFullYear(now.getFullYear() + 1);
    }
    const diffMs = lessonDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    let dateString = "";
    if (diffDays) dateString += diffDays + "d ";
    if (diffHours) dateString += diffHours + "h ";
    if (diffMinutes) dateString += diffMinutes + "m ";
    if (diffSeconds) dateString += diffSeconds + "s ";
    // ^ coded by copilot

    textForWidget = `Next lesson in ${dateString}\n`;
    const firstGroup = nextLesson.subgroups[0];
    const secondGroup = nextLesson.subgroups[1];
    textForWidget += `${secondGroup ? `(${firstGroup.name}):` : ""} `
        + `[${firstGroup.classroom}] ${firstGroup.lessonName}`;
    if (secondGroup) {
        textForWidget += `\n(${secondGroup.name}): [${secondGroup.classroom}] ${secondGroup.lessonName}`;
    }
}

const widget = new ListWidget();
widget.setPadding(0,5,0,5);
widget.refreshAfterDate = new Date(Date.now() + 1000*60);

textForWidget.split("\n").forEach((text, index) => {
    const widgetText = widget.addText(text);
    widget.addSpacer(index === 0 ? 10 : 4);
    const font = new Font("Menlo", index === 0 ? 14 : 12);
    widgetText.font = font;
    widgetText.centerAlignText();
})

Script.setWidget(widget);
Script.complete();