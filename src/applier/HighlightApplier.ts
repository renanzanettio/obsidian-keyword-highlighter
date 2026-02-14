import { Editor } from "obsidian";
import { HighlightCandidate } from "../analyzer/StudyAnalyzer";

export class HighlightApplier {

    apply(editor: Editor, candidates: HighlightCandidate[]) {

        const content = editor.getValue();
        const lines = content.split("\n");

        const updatedLines = lines.map(line => {

            const match = candidates.find(c => c.text === line);
            if (!match || match.type === "acronym") return line;

            // Já está destacado?
            if (line.startsWith("==") && line.endsWith("==")) {
                return line;
            }

            // Detecta prefixos estruturais
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
}