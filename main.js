"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => AutomaticHighlighter
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/analyzer/StudyAnalyzer.ts
var StudyAnalyzer = class {
  analyze(content) {
    const results = [];
    const lines = content.split("\n");
    let offset = 0;
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      let detectedType = null;
      let start = offset;
      let end = offset + line.length;
      if (lowerLine.includes(" \xE9 ") || lowerLine.includes(" is ") || lowerLine.includes(" refere-se a ") || lowerLine.includes(" is defined as ") || lowerLine.includes(" consiste em ") || lowerLine.includes(" consists of ")) {
        detectedType = "definition";
      } else if (lowerLine.includes("visa") || lowerLine.includes("serve para") || lowerLine.includes("tem como objetivo") || lowerLine.includes("permite") || lowerLine.includes("allows") || lowerLine.includes("enables") || lowerLine.includes("aims to") || lowerLine.includes("is used to")) {
        detectedType = "purpose";
      } else if (lowerLine.includes("por exemplo") || lowerLine.includes("for example") || lowerLine.includes("for instance") || lowerLine.includes("e.g.")) {
        detectedType = "example";
      } else if (lowerLine.includes("diferente de") || lowerLine.includes("similar to") || lowerLine.includes("in contrast") || lowerLine.includes("por outro lado") || lowerLine.includes("on the other hand")) {
        detectedType = "comparison";
      } else if (lowerLine.includes("importante") || lowerLine.includes("fundamental") || lowerLine.includes("essential") || lowerLine.includes("crucial") || lowerLine.includes("key")) {
        detectedType = "important";
      } else if (lowerLine.includes("em resumo") || lowerLine.includes("portanto") || lowerLine.includes("therefore") || lowerLine.includes("in summary") || lowerLine.includes("thus")) {
        detectedType = "conclusion";
      }
      if (detectedType) {
        results.push({
          text: line,
          start,
          end,
          type: detectedType
        });
      }
      const acronymMatch = line.match(/\b[A-Z]{2,}\s*\([^)]+\)/);
      if (acronymMatch) {
        const index = line.indexOf(acronymMatch[0]);
        results.push({
          text: acronymMatch[0],
          start: offset + index,
          end: offset + index + acronymMatch[0].length,
          type: "acronym"
        });
      }
      offset += line.length + 1;
    }
    return results;
  }
};

// src/modal/ConfirmHighlightModal.ts
var import_obsidian = require("obsidian");
var ConfirmHighlightModal = class extends import_obsidian.Modal {
  constructor(app, highlightCount, onConfirm, onCancel) {
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
};

// src/applier/HighlightApplier.ts
var HighlightApplier = class {
  apply(editor, candidates) {
    const content = editor.getValue();
    const lines = content.split("\n");
    const updatedLines = lines.map((line) => {
      const match = candidates.find((c) => c.text === line);
      if (!match || match.type === "acronym") return line;
      if (line.startsWith("==") && line.endsWith("==")) {
        return line;
      }
      const prefixMatch = line.match(/^(\s*(\d+\.\s|- |\> |#{1,6}\s))/);
      if (prefixMatch) {
        const prefix = prefixMatch[0];
        const rest = line.slice(prefix.length);
        return `${prefix}==${rest}==`;
      }
      return `==${line}==`;
    });
    editor.setValue(updatedLines.join("\n"));
  }
};

// src/workflow/HighlightWorkflow.ts
var HighlightWorkflow = class {
  constructor(app) {
    this.app = app;
    this.analyzer = new StudyAnalyzer();
    this.applier = new HighlightApplier();
  }
  run(editor) {
    const originalContent = editor.getValue();
    const candidates = this.analyzer.analyze(originalContent);
    if (candidates.length === 0) return;
    this.applier.apply(editor, candidates);
    new ConfirmHighlightModal(
      this.app,
      candidates.length,
      () => {
      },
      () => {
        editor.setValue(originalContent);
      }
    ).open();
  }
};

// src/main.ts
var AutomaticHighlighter = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.analyzer = new StudyAnalyzer();
  }
  executeWorkflow() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
    if (!view) return;
    const editor = view.editor;
    if (!editor) return;
    const workflow = new HighlightWorkflow(this.app);
    workflow.run(editor);
  }
  registerAnalyzeCommand() {
    this.addCommand({
      id: "analyze-and-highlight",
      name: "Analyze and Suggest Highlights",
      callback: () => this.executeWorkflow()
    });
  }
  registerNotificationCommand() {
    this.addCommand({
      id: "show-notification",
      name: "Show Notification",
      callback: () => {
        new import_obsidian2.Notice("This is a notification from the Keyword Highlighter Plugin!");
      }
    });
  }
  registerReloadCommand() {
    this.addCommand({
      id: "reload-plugin",
      name: "Reload this plugin",
      callback: async () => {
        const id = this.manifest.id;
        await this.app.plugins.disablePlugin(id);
        await this.app.plugins.enablePlugin(id);
        new import_obsidian2.Notice("Keyword Highlighter plugin reloaded!");
      }
    });
  }
  async onload() {
    console.log("Loading Keyword Highlighter Plugin");
    this.registerAnalyzeCommand();
    this.registerNotificationCommand();
    this.registerReloadCommand();
  }
  onunload() {
    console.log("Unloading Keyword Highlighter Plugin");
  }
};
//# sourceMappingURL=main.js.map
