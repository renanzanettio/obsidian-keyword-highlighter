import { Plugin, Notice, MarkdownView } from 'obsidian';
import { StudyAnalyzer } from './analyzer/StudyAnalyzer';
import { HighlightWorkflow } from './workflow/HighlightWorkflow';




export default class AutomaticHighlighter extends Plugin {

    private analyzer = new StudyAnalyzer();

    private executeWorkflow() {

        const view = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;

        const editor = view.editor;
        if (!editor) return;

        const workflow = new HighlightWorkflow(this.app);
        workflow.run(editor);
    }


    private registerAnalyzeCommand() {
        this.addCommand({
            id: "analyze-and-highlight",
            name: "Analyze and Suggest Highlights",
            callback: () => this.executeWorkflow()
        });
    }



    private registerNotificationCommand() {

        this.addCommand({
            id: 'show-notification',
            name: 'Show Notification',
            callback: () => {
                new Notice('This is a notification from the Keyword Highlighter Plugin!');
            }
        });

    }

    private registerReloadCommand() {
        this.addCommand({
            id: 'reload-plugin',
            name: 'Reload this plugin',
            callback: async () => {
                const id = this.manifest.id;

                // @ts-ignore (internal API from Obsidian)
                await this.app.plugins.disablePlugin(id);

                // @ts-ignore (internal API from Obsidian)
                await this.app.plugins.enablePlugin(id);
                new Notice('Keyword Highlighter plugin reloaded!');
            }
        });
    }

    async onload() {
        // this is called when the plugin is loaded
        console.log('Loading Keyword Highlighter Plugin');

        this.registerAnalyzeCommand();
        this.registerNotificationCommand();
        this.registerReloadCommand();

    }

    onunload() {
        // this is called when the plugin is unloaded
        console.log('Unloading Keyword Highlighter Plugin');
    }



}