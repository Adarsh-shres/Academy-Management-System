import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildGeminiRequest, extractGeminiReply } from './chat.js';

describe('Gemini chat route helpers', () => {
  it('builds a Gemini generateContent request from chat messages', () => {
    const request = buildGeminiRequest([
      { role: 'assistant', content: 'Welcome to Learnify.' },
      { role: 'user', content: 'How do I submit an assignment?' },
    ]);

    assert.match(request.systemInstruction.parts[0].text, /Learnify/);
    assert.deepEqual(request.contents, [
      { role: 'model', parts: [{ text: 'Welcome to Learnify.' }] },
      { role: 'user', parts: [{ text: 'How do I submit an assignment?' }] },
    ]);
    assert.equal(request.generationConfig.maxOutputTokens, 1024);
    assert.equal(request.generationConfig.temperature, 0.7);
  });

  it('extracts the first text part from a Gemini response', () => {
    const reply = extractGeminiReply({
      candidates: [
        {
          content: {
            parts: [{ text: 'Open Assignments, choose a task, then upload your file.' }],
          },
        },
      ],
    });

    assert.equal(reply, 'Open Assignments, choose a task, then upload your file.');
  });
});
