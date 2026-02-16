import { App, Editor } from 'obsidian';
import { HighlightResult } from '../core/interfaces/HighlightResult';

export class HighlightWorkflow {
    constructor(private app: App) { }

    // Adicione highlights como argumento opcional
    run(editor: Editor, highlights: HighlightResult[]) {
        if (!highlights || highlights.length === 0) return;

        // Ordena do maior start para o menor
        const sorted = highlights.sort((a, b) => b.start - a.start);

        let text = editor.getValue();

        sorted.forEach(h => {

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
}