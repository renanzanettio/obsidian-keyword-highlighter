import { AIProvider } from "../interfaces/AIProvider";
import { NoteAnalyzer } from "../interfaces/NoteAnalyzer";
import { HighlightResult } from "../interfaces/HighlightResult";

export class GeminiAnalyzer implements NoteAnalyzer {
  constructor(private aiProvider: AIProvider) { }

  async analyze(noteContent: string): Promise<HighlightResult[]> {
    const prompt = this.buildPrompt(noteContent);
    const raw = await this.aiProvider.generateContent(prompt);

    // Limpa crases, markdown, e espaços extras
    let cleaned = raw.replace(/```json|```/g, '').trim();

    let parsed: { text: string; type: string }[];

    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON inválido recebido do Gemini:", cleaned);
      throw new Error(`Resposta da IA não é JSON válido. Conteúdo retornado: ${cleaned}`);
    }

    // Converte para o formato completo com índices
    return this.validateAndFix(parsed, noteContent);
  }

  private buildPrompt(noteContent: string): string {
    return `
Você é um assistente especializado em análise de anotações acadêmicas.

Sua tarefa é extrair apenas trechos curtos, significativos e explicativos do texto, úteis para estudo (como flashcards conceituais).

Regras obrigatórias:
1. Retorne SOMENTE JSON válido.
2. NÃO use markdown, crases, comentários ou explicações.
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
   - "start": índice inicial
   - "end": índice final

Critérios de classificação:
- Use "definition" quando houver explicação formal do que algo é.
- Use "principle" para regras centrais que orientam comportamento ou filosofia.
- Use "practice" para ações recomendadas ou aplicáveis.
- Use "guideline" para orientações gerais.
- Use "value" para valores ou cultura.
- Use "metric" quando indicar medida de progresso ou critério de avaliação.
- Use "warning" quando indicar algo que não deve ser feito ou risco.
- Use "classification" quando dividir algo em tipos.
- Use "concept" para ideias explicativas importantes.

Extraia apenas trechos que tenham significado completo.
Ignore frases triviais, conectivos e repetições.

Regras obrigatórias adicionais:

- O trecho NÃO pode ultrapassar 180 caracteres.
- O trecho NÃO pode ultrapassar 25 palavras.
- NÃO extraia frases completas longas.
- Extraia apenas o núcleo conceitual da ideia.
- Se uma frase for longa, selecione apenas a parte essencial que carrega o significado principal.
- NÃO marque linhas inteiras ou parágrafos completos.
- O objetivo é criar destaques rápidos que permitam revisão sem precisar reler o texto inteiro.

O trecho deve parecer um highlight feito manualmente com marca-texto.

Texto:
"""
${noteContent}
"""
`;
  }

  private validateAndFix(
    results: { text: string; type: string }[],
    content: string
  ): HighlightResult[] {
    return results
      .map(item => {
        const start = content.indexOf(item.text);
        if (start === -1) return null;

        return {
          text: item.text,
          type: item.type,
          start,
          end: start + item.text.length
        };
      })
      .filter(Boolean) as HighlightResult[];
  }
}