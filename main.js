"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
class KeywordHighlighterPlugin extends obsidian_1.Plugin {
    registerExtractKeywordsCommand() {
        this.addCommand({
            id: 'extract-keywords',
            name: 'Extract Keywords',
            callback: () => {
                // this is where you would implement the keyword extraction logic
                console.log('Extracting keywords from the current note...');
            }
        });
    }
    RegisterNotificationCommand() {
        this.addCommand({
            id: 'show-notification',
            name: 'Show Notification',
            callback: () => {
                new obsidian_1.Notice('This is a notification from the Keyword Highlighter Plugin!');
            }
        });
    }
    async onload() {
        // this is called when the plugin is loaded
        console.log('Loading Keyword Highlighter Plugin');
        this.registerExtractKeywordsCommand();
        this.RegisterNotificationCommand();
    }
    onunload() {
        // this is called when the plugin is unloaded
        console.log('Unloading Keyword Highlighter Plugin');
    }
}
exports.default = KeywordHighlighterPlugin;
