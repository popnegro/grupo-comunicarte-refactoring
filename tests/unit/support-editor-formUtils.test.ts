import test from 'node:test';
import assert from 'node:assert/strict';
import { extractCoordsFromUrl, isFormDirty, normalize, payloadFrom } from '../../src/pages/dashboard/support-editor/formUtils';
import { emptyForm } from '../../src/pages/dashboard/support-editor/types';

test('extractCoordsFromUrl parses Google Maps @ coordinates', () => {
  assert.deepEqual(extractCoordsFromUrl('https://maps.google.com/@-32.997896,-68.904733,17z'), {
    lat: '-32.997896',
    lng: '-68.904733',
  });
});

test('extractCoordsFromUrl parses direct coordinates and rejects empty input', () => {
  assert.deepEqual(extractCoordsFromUrl('-32.997896, -68.904733'), {
    lat: '-32.997896',
    lng: '-68.904733',
  });
  assert.equal(extractCoordsFromUrl(''), null);
});

test('normalize preserves editorial monthly impacts', () => {
  const normalized = normalize({
    name: 'Soporte test',
    tipo_soporte: 'tradicional',
    technical: { measures: '430 x 460 cm.', monthly_impacts: 123 },
  });
  assert.equal(normalized.traditional.monthly_impacts, '123');
});

test('payloadFrom produces canonical numeric payloads', () => {
  const form = {
    ...emptyForm,
    publicName: 'Soporte test',
    tipo_soporte: 'tradicional' as const,
    traditional: {
      ...emptyForm.traditional,
      medidas: '430 x 460 cm.',
      caras: '2',
      monthly_impacts: '123',
    },
    pricing: {
      ...emptyForm.pricing,
      exhibition: '1000',
      installation: '200',
      printing: '300',
    },
  };
  const payload = payloadFrom(form);
  assert.equal(payload.technical.caras, 2);
  assert.equal(payload.technical.monthly_impacts, 123);
  assert.equal(payload.pricing.exhibition_price, 1000);
});

test('isFormDirty detects nested field changes', () => {
  const changed = { ...emptyForm, traditional: { ...emptyForm.traditional, monthly_impacts: '123' } };
  assert.equal(isFormDirty(emptyForm, changed), true);
  assert.equal(isFormDirty(emptyForm, emptyForm), false);
});
