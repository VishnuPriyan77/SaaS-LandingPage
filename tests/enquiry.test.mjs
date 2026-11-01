import test from 'node:test';
import assert from 'node:assert/strict';
import { enquiryDraft, EMAIL } from '../src/enquiry.ts';

test('a draft preserves special characters and line breaks without adding URL parameters', () => {
  const form = new FormData();
  form.set('name', 'Asha & Co?'); form.set('email', 'asha@example.com');
  form.set('product', 'https://example.com/?a=1&b=2'); form.set('type', 'Launch film');
  form.set('brief', 'Explain café tools.\nThen show pricing & features?');
  const draft = new URL(enquiryDraft(form));
  assert.equal(draft.protocol, 'mailto:'); assert.equal(draft.pathname, EMAIL);
  assert.deepEqual([...draft.searchParams.keys()], ['subject', 'body']);
  assert.equal(draft.searchParams.get('subject'), 'Video enquiry — Asha & Co?');
  assert.ok(draft.searchParams.get('body').includes('https://example.com/?a=1&b=2'));
  assert.ok(draft.searchParams.get('body').endsWith('Explain café tools.\nThen show pricing & features?'));
});
test('optional fields can be empty without undefined values leaking into the draft', () => {
  const form = new FormData(); form.set('name', 'Sam'); form.set('brief', 'A product demo');
  const body = new URL(enquiryDraft(form)).searchParams.get('body');
  assert.ok(!body.includes('undefined')); assert.ok(!body.includes('null'));
});
