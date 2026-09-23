import test from 'node:test';
import assert from 'node:assert/strict';
import { hasValidMagicNumber } from '../src/server/multimediaUpload.ts';

test('accepts matching JPEG and PNG signatures', () => {
  assert.equal(hasValidMagicNumber(Buffer.from([0xff, 0xd8, 0xff, 0x00]), 'image/jpeg'), true);
  assert.equal(hasValidMagicNumber(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), 'image/png'), true);
});

test('rejects MIME/signature mismatch', () => {
  assert.equal(hasValidMagicNumber(Buffer.from('<svg></svg>'), 'image/png'), false);
  assert.equal(hasValidMagicNumber(Buffer.from([0xff,0xd8,0xff]), 'image/png'), false);
});
