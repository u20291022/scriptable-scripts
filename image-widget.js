// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: blue; icon-glyph: image;

// script
// get local file storage
const localFiles = FileManager.local();
const documentsPath = localFiles.documentsDirectory();
// txt file that stores our image path
const imageFile = localFiles.joinPath(documentsPath, "image.jpg");

// if we are not in widget
if (!config.runsInWidget) {
    // pick photo path
    const imagePath = (await DocumentPicker.open())[0];
    const image = localFiles.readImage(imagePath);
    // and store it
    localFiles.writeImage(imageFile, image);
}
// if we are in widget
else {
    // create widget
    const widget = new ListWidget();
    widget.setPadding(0,0,0,0);
    // add image to widget
    const image = localFiles.readImage(imageFile);
    const widgetImage = widget.addImage(image);
    // customize widget image
    widgetImage.imageSize = new Size(162, 162);
    widgetImage.centerAlignImage();
    widgetImage.containerRelativeShape = true;
    widgetImage.applyFillingContentMode();
    // setup widget
    Script.setWidget(widget);
}

Script.complete();