export const PDF_TOOL_PROMPTS = {

    summarize: `
Summarize the latest uploaded PDF.

Instructions:
- Use headings.
- Use bullet points.
- Explain important concepts clearly.
- Mention key definitions.
- Include page citations whenever possible.
`,

    notes: `
Generate detailed study notes from the latest uploaded PDF.

Instructions:
- Use headings.
- Use bullet points.
- Include important definitions.
- Mention page citations whenever possible.
`,

    flashcards: `
Generate flashcards from the latest uploaded PDF.

Instructions:
- Question on one line.
- Answer on next line.
- Cover all important concepts.
`,

    quiz: `
Generate 20 multiple-choice questions from the latest uploaded PDF.

Instructions:
- Four options.
- Highlight the correct answer.
- Include questions from all major topics.
`,

    interview: `
Generate interview questions from the latest uploaded PDF.

Instructions:
- Beginner questions.
- Intermediate questions.
- Advanced questions.
- Include short answers.
`,

    mindmap: `
Create a hierarchical mind map from the latest uploaded PDF.
`,

    cheatsheet: `
Create a one-page cheat sheet from the latest uploaded PDF.
`,

    keytopics: `
List all important topics from the latest uploaded PDF with short explanations.
`

};