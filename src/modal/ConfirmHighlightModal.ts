import { App, Modal } from "obsidian";

export class ConfirmHighlightModal extends Modal {

    private onConfirm: () => void;
    private onCancel: () => void;
    private highlightCount: number;

    constructor(
        app: App,
        highlightCount: number,
        onConfirm: () => void,
        onCancel: () => void
    ) {
        super(app);
        this.highlightCount = highlightCount;
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass("ah-modal");

        contentEl.createEl("h2", {
            text: "Highlights Applied"
        });

        contentEl.createEl("p", {
            text: `${this.highlightCount} highlights were added to this note.`
        });

        contentEl.createEl("p", {
            text: "Would you like to keep the changes?"
        });

        const buttonContainer = contentEl.createDiv({
            cls: "ah-modal-buttons"
        });

        const keepBtn = buttonContainer.createEl("button", {
            text: "Keep Changes",
            cls: "mod-cta"
        });

        keepBtn.onclick = () => {
            this.onConfirm();
            this.close();
        };

        const revertBtn = buttonContainer.createEl("button", {
            text: "Revert"
        });

        revertBtn.onclick = () => {
            this.onCancel();
            this.close();
        };
    }

    onClose() {
        this.contentEl.empty();
    }
}