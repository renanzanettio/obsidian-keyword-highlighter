import { App, Editor } from "obsidian";
import { StudyAnalyzer } from "../analyzer/StudyAnalyzer";
import { ConfirmHighlightModal } from "../modal/ConfirmHighlightModal";
import { HighlightApplier } from "../applier/HighlightApplier";

export class HighlightWorkflow {

    private app: App;
    private analyzer: StudyAnalyzer;
    private applier: HighlightApplier;

    constructor(app: App) {
        this.app = app;
        this.analyzer = new StudyAnalyzer();
        this.applier = new HighlightApplier();
    }

    run(editor: Editor) {

        const originalContent = editor.getValue();
        const candidates = this.analyzer.analyze(originalContent);

        if (candidates.length === 0) return;

        this.applier.apply(editor, candidates);

        new ConfirmHighlightModal(
            this.app,
            candidates.length,
            () => {
                // KEEP → não faz nada
            },
            () => {
                editor.setValue(originalContent);
            }
        ).open();
    }
}