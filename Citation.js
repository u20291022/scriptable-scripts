// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-brown; icon-glyph: feather-alt;
const widget = new ListWidget();
const text = widget.addText("be grateful for everything.");
text.font = new Font("Thonburi", 14);
text.centerAlignText(); 
text.textColor = Color.clear();
Script.setWidget(widget);
Script.complete();