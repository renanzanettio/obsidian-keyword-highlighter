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

// src/infrastructure/ai/GeminiProvider.ts
var GeminiProvider = class {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  async generateContent(prompt) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );
    const data = await response.json();
    let resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      throw new Error("Resposta do Gemini vazia ou inv\xE1lida");
    }
    resultText = resultText.replace(/```json|```/g, "").trim();
    console.log("Resposta bruta do Gemini:", resultText);
    return resultText;
  }
};

// src/core/services/GeminiAnalyzer.ts
var GeminiAnalyzer = class {
  constructor(aiProvider) {
    this.aiProvider = aiProvider;
  }
  async analyze(noteContent) {
    const prompt = this.buildPrompt(noteContent);
    const raw = await this.aiProvider.generateContent(prompt);
    let cleaned = raw.replace(/```json|```/g, "").trim();
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON inv\xE1lido recebido do Gemini:", cleaned);
      throw new Error(`Resposta da IA n\xE3o \xE9 JSON v\xE1lido. Conte\xFAdo retornado: ${cleaned}`);
    }
    return this.validateAndFix(parsed, noteContent);
  }
  buildPrompt(noteContent) {
    return `
Voc\xEA \xE9 um assistente especializado em an\xE1lise de anota\xE7\xF5es acad\xEAmicas.

Sua tarefa \xE9 extrair apenas trechos curtos, significativos e explicativos do texto, \xFAteis para estudo (como flashcards conceituais).

Regras obrigat\xF3rias:
1. Retorne SOMENTE JSON v\xE1lido.
2. N\xC3O use markdown, crases, coment\xE1rios ou explica\xE7\xF5es.
3. Retorne apenas um array JSON.
4. Cada item deve conter:
   - "text": trecho exato retirado do texto
   - "type": um dos seguintes valores:
        "definition"
        "principle"
        "concept"
        "guideline"
        "practice"
        "value"
        "metric"
        "warning"
        "classification"
   - "start": \xEDndice inicial
   - "end": \xEDndice final

Crit\xE9rios de classifica\xE7\xE3o:
- Use "definition" quando houver explica\xE7\xE3o formal do que algo \xE9.
- Use "principle" para regras centrais que orientam comportamento ou filosofia.
- Use "practice" para a\xE7\xF5es recomendadas ou aplic\xE1veis.
- Use "guideline" para orienta\xE7\xF5es gerais.
- Use "value" para valores ou cultura.
- Use "metric" quando indicar medida de progresso ou crit\xE9rio de avalia\xE7\xE3o.
- Use "warning" quando indicar algo que n\xE3o deve ser feito ou risco.
- Use "classification" quando dividir algo em tipos.
- Use "concept" para ideias explicativas importantes.

Extraia apenas trechos que tenham significado completo.
Ignore frases triviais, conectivos e repeti\xE7\xF5es.

Regras obrigat\xF3rias adicionais:

- O trecho N\xC3O pode ultrapassar 180 caracteres.
- O trecho N\xC3O pode ultrapassar 25 palavras.
- N\xC3O extraia frases completas longas.
- Extraia apenas o n\xFAcleo conceitual da ideia.
- Se uma frase for longa, selecione apenas a parte essencial que carrega o significado principal.
- N\xC3O marque linhas inteiras ou par\xE1grafos completos.
- O objetivo \xE9 criar destaques r\xE1pidos que permitam revis\xE3o sem precisar reler o texto inteiro.

O trecho deve parecer um highlight feito manualmente com marca-texto.

Texto:
"""
${noteContent}
"""
`;
  }
  validateAndFix(results, content) {
    return results.map((item) => {
      const start = content.indexOf(item.text);
      if (start === -1) return null;
      return {
        text: item.text,
        type: item.type,
        start,
        end: start + item.text.length
      };
    }).filter(Boolean);
  }
};

// src/workflow/HighlightWorkflow.ts
var HighlightWorkflow = class {
  constructor(app) {
    this.app = app;
  }
  // Adicione highlights como argumento opcional
  run(editor, highlights) {
    if (!highlights || highlights.length === 0) return;
    const sorted = highlights.sort((a, b) => b.start - a.start);
    let text = editor.getValue();
    sorted.forEach((h) => {
      switch (h.type) {
        case "definition":
          text = `${text.slice(0, h.start)}<mark style="background-color: #FFF59DB3">${h.text}</mark>${text.slice(h.end)}`;
          break;
        case "principle":
          text = `${text.slice(0, h.start)}<mark style="background-color: #E1BEE7B3">${h.text}</mark>${text.slice(h.end)}`;
          break;
        case "concept":
          text = `${text.slice(0, h.start)}<mark style="background-color: #BBDEFBB3">${h.text}</mark>${text.slice(h.end)}`;
          break;
        case "guideline":
          text = `${text.slice(0, h.start)}<mark style="background-color: #FFE0B2B3">${h.text}</mark>${text.slice(h.end)}`;
          break;
        case "practice":
          text = `${text.slice(0, h.start)}<mark style="background-color: #C8E6C9B3">${h.text}</mark>${text.slice(h.end)}`;
          break;
        case "value":
          text = `${text.slice(0, h.start)}<mark style="background-color: #F8BBD0B3">${h.text}</mark>${text.slice(h.end)}`;
          break;
        case "metric":
          text = `${text.slice(0, h.start)}<mark style="background-color: #B2EBF2B3">${h.text}</mark>${text.slice(h.end)}`;
          break;
        case "warning":
          text = `${text.slice(0, h.start)}<mark style="background-color: #FFCDD2B3">${h.text}</mark>${text.slice(h.end)}`;
          break;
        case "classification":
          text = `${text.slice(0, h.start)}<mark style="background-color: #DCEDC8B3">${h.text}</mark>${text.slice(h.end)}`;
          break;
        default:
          console.warn(`Tipo desconhecido: ${h.type}`);
          break;
      }
    });
    editor.setValue(text);
  }
};

// src/ui/SettingsTab.ts
var import_obsidian = require("obsidian");
var AutomaticHighlighterSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Configura\xE7\xF5es do Automatic Highlighter" });
    new import_obsidian.Setting(containerEl).setName("Gemini API Key").setDesc("Digite sua chave da API do Gemini aqui.").addText(
      (text) => text.setPlaceholder("Insira sua API key").setValue(this.plugin.settings.geminiApiKey).onChange(async (value) => {
        this.plugin.settings.geminiApiKey = value;
        await this.plugin.saveSettings();
      })
    );
  }
};

// src/main.ts
var DEFAULT_SETTINGS = {
  geminiApiKey: ""
};
var AutomaticHighlighter = class extends import_obsidian2.Plugin {
  async onload() {
    console.log("Loading Automatic Highlighter Plugin");
    await this.loadSettings();
    this.addSettingTab(new AutomaticHighlighterSettingsTab(this.app, this));
    this.registerAnalyzeCommand();
    this.registerNotificationCommand();
    this.registerReloadCommand();
  }
  onunload() {
    console.log("Unloading Automatic Highlighter Plugin");
  }
  // ===============================
  // Settings
  // ===============================
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  // ===============================
  // Comandos
  // ===============================
  registerAnalyzeCommand() {
    this.addCommand({
      id: "analyze-and-highlight",
      name: "Analyze and Suggest Highlights",
      callback: async () => await this.executeWorkflow()
    });
  }
  registerNotificationCommand() {
    this.addCommand({
      id: "show-notification",
      name: "Show Notification",
      callback: () => {
        new import_obsidian2.Notice("This is a notification from the Automatic Highlighter Plugin!");
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
        new import_obsidian2.Notice("Automatic Highlighter plugin reloaded!");
      }
    });
  }
  // ===============================
  // Fluxo principal
  // ===============================
  async executeWorkflow() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian2.MarkdownView);
    if (!view) return;
    const editor = view.editor;
    if (!editor) return;
    const content = editor.getValue();
    const provider = new GeminiProvider(this.settings.geminiApiKey);
    const analyzer = new GeminiAnalyzer(provider);
    let highlights;
    try {
      highlights = await analyzer.analyze(content);
    } catch (err) {
      console.error("Erro ao analisar nota:", err);
      new import_obsidian2.Notice("Erro ao analisar nota. Veja console para detalhes.");
      return;
    }
    if (!highlights || highlights.length === 0) {
      new import_obsidian2.Notice("Nenhum destaque encontrado.");
      return;
    }
    const workflow = new HighlightWorkflow(this.app);
    workflow.run(editor, highlights);
    new import_obsidian2.Notice(`Applied ${highlights.length} highlights!`);
  }
};
//# sourceMappingURL=main.js.map
