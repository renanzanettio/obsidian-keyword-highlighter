export type HighlightType =
    | "definition"
    | "purpose"
    | "principle"
    | "acronym"
    | "comparison"
    | "important"
    | "example"
    | "conclusion"
    | "warning";

export interface HighlightCandidate {
    text: string;
    start: number;
    end: number;
    type: HighlightType;
}

export class StudyAnalyzer {

    analyze(content: string): HighlightCandidate[] {
        const results: HighlightCandidate[] = [];

        const lines = content.split("\n");
        let offset = 0;

        for (const line of lines) {

            const lowerLine = line.toLowerCase();

            let detectedType: HighlightType | null = null;
            let start = offset;
            let end = offset + line.length;

            // PRIORIDADE 3 - DEFINITION (PT + EN)
            if (
                lowerLine.includes(" é ") ||
                lowerLine.includes(" is ") ||
                lowerLine.includes(" refere-se a ") ||
                lowerLine.includes(" is defined as ") ||
                lowerLine.includes(" consiste em ") ||
                lowerLine.includes(" consists of ")
            ) {
                detectedType = "definition";
            }

            // PRIORIDADE 4 - PURPOSE (PT + EN)
            else if (
                lowerLine.includes("visa") ||
                lowerLine.includes("serve para") ||
                lowerLine.includes("tem como objetivo") ||
                lowerLine.includes("permite") ||
                lowerLine.includes("allows") ||
                lowerLine.includes("enables") ||
                lowerLine.includes("aims to") ||
                lowerLine.includes("is used to")
            ) {
                detectedType = "purpose";
            }

            // PRIORIDADE 5 - EXAMPLE
            else if (
                lowerLine.includes("por exemplo") ||
                lowerLine.includes("for example") ||
                lowerLine.includes("for instance") ||
                lowerLine.includes("e.g.")
            ) {
                detectedType = "example";
            }

            // PRIORIDADE 6 - COMPARISON
            else if (
                lowerLine.includes("diferente de") ||
                lowerLine.includes("similar to") ||
                lowerLine.includes("in contrast") ||
                lowerLine.includes("por outro lado") ||
                lowerLine.includes("on the other hand")
            ) {
                detectedType = "comparison";
            }

            // PRIORIDADE 7 - IMPORTANT
            else if (
                lowerLine.includes("importante") ||
                lowerLine.includes("fundamental") ||
                lowerLine.includes("essential") ||
                lowerLine.includes("crucial") ||
                lowerLine.includes("key")
            ) {
                detectedType = "important";
            }

            // PRIORIDADE 8 - CONCLUSION
            else if (
                lowerLine.includes("em resumo") ||
                lowerLine.includes("portanto") ||
                lowerLine.includes("therefore") ||
                lowerLine.includes("in summary") ||
                lowerLine.includes("thus")
            ) {
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

            // ACRONYM (separado, porque pode estar dentro de outro tipo)
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
}