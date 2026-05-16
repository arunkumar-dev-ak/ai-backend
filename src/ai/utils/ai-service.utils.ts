export const makeStructuredDebugPrompt = ({
  code,
  language,
}: {
  code: string;
  language: string;
}) => {
  const prompt = `
        You are a senior software engineer.

        Analyze the following ${language} code and:
        1. Identify the bug
        2. Provide the corrected code
        3. Explain the issue simply

        Code:
        ${code}

        Return response in JSON format:
        {
          "bug": "...",
          "fix": "...",
          "explanation": "..."
        }
        `;

  return prompt;
};

export function cleanJsonResponse(text: string): string {
  return text
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
}

type DebugResponse = {
  bug: string;
  fix: string;
  explanation: string;
};

export function isDebugResponse(data: unknown): data is DebugResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'bug' in data &&
    'fix' in data &&
    'explanation' in data
  );
}
