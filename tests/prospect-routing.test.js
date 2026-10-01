import test from 'node:test';
import assert from 'node:assert/strict';
import { isGeneralAnkurQuestion } from '../outlever-site/lib/assistant-routing.ts';

test('prospect evidence questions stay on the research route', () => {
  for (const question of [
    'What would you do first for Outlever?',
    'Do the owned-media pages cannibalise?',
    'What evidence is missing from the pilot?',
    'Can you help Outlever with the Search + AI Capture Layer?',
  ]) assert.equal(isGeneralAnkurQuestion(question, true), false, question);
});

test('Ankur work and service-fit questions use the standalone AI Twin', () => {
  for (const question of [
    'Who is Ankur?',
    'What have you built?',
    'Can you help us with SEO and AI search?',
    'What kind of products can you build for my company?',
    'Which service is right for us?',
    'Tell me about Pepys',
  ]) assert.equal(isGeneralAnkurQuestion(question), true, question);
  assert.equal(isGeneralAnkurQuestion('Getting found', true), true);
});
