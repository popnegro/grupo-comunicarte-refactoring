import { test, expect } from '@playwright/test';

const support = {
  canonical_id: 'smoke-trad-01',
  name: 'Soporte Smoke 4x4',
  ciudad: 'mendoza',
  tipo_soporte: 'tradicional',
  family: 'traditional',
  active: true,
  disponibilidad: 'disponible',
  isFeatured: false,
  address: 'Panamericana casi YPF, Luján de Cuyo',
  lat: -32.997896,
  lng: -68.904733,
  mapa_url: 'https://maps.google.com/@-32.997896,-68.904733,17z',
  description: 'Soporte creado por smoke test.',
  imageUrls: ['https://example.com/support.jpg'],
  technical: {
    measures: '430 x 460 cm.',
    caras: 2,
    impresion: 'Impresión',
    monthly_impacts: 123,
    metadata: { cover_media_type: 'image' },
  },
  pricing: {
    exhibition_price: 0,
    installation_price: 0,
    printing_price: 0,
    monthly_price: 0,
    exclusive_price: 0,
    currency: 'ARS',
  },
};

test('support flow: create → edit → preview → list filter', async ({ page }) => {
  await page.route('**/api/admin/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data: {} }),
    });
  });

  await page.route('**/api/admin/supports/**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: support }) });
      return;
    }
    await route.continue();
  });

  await page.route('**/api/admin/supports', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: [support] }) });
      return;
    }
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: support }) });
      return;
    }
    await route.continue();
  });

  await page.goto('/dashboard/soportes/new');
  await expect(page.getByRole('heading', { name: 'Nuevo soporte' })).toBeVisible();

  await page.getByLabel('Nombre público *').fill('Soporte Smoke 4x4');
  await page.getByRole('button', { name: 'Crear soporte' }).click();

  await expect(page.getByRole('status')).toContainText('Soporte guardado correctamente.');
  await expect(page.locator('h1', { hasText: 'Soporte Smoke 4x4' })).toBeVisible();

  await page.getByRole('button', { name: 'Preview', exact: true }).click();
  await expect(page.locator('h1', { hasText: 'Soporte Smoke 4x4' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Revisión de publicación' })).toBeVisible();

  await page.goto('/dashboard/soportes');
  await expect(page.getByRole('heading', { name: 'Gestión de Soportes' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Buscar soportes' }).fill('Smoke');

  if ((page.viewportSize()?.width || 0) < 768) {
    await expect(page.locator('article').getByText('Soporte Smoke 4x4')).toBeVisible();
  } else {
    await expect(page.locator('table').getByText('Soporte Smoke 4x4')).toBeVisible();
  }
  await expect(page.getByText('Mostrando 1 de 1 soportes')).toBeVisible();
});

test('dashboard support editor layout remains usable after opening edit', async ({ page }) => {
  await page.route('**/api/admin/stats', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data: {} }),
    });
  });

  await page.route('**/api/admin/requests', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'success', data: [] }),
    });
  });

  await page.route('**/api/admin/supports/**', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: support }),
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/api/admin/supports', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'success', data: [support] }),
      });
      return;
    }
    await route.continue();
  });

  await page.goto('/dashboard/soportes');
  await expect(page.getByRole('heading', { name: 'Gestión de Soportes' })).toBeVisible();

  const editButton = page.getByRole('button', { name: 'Editar', exact: true }).first();
  await expect(editButton).toBeVisible();
  await editButton.click();
  await expect(page.getByRole('heading', { name: 'Soporte Smoke 4x4' }).first()).toBeVisible();

  // This is an intentional interaction redesign (full-page route -> side drawer),
  // so compare its responsive geometry and usability rather than pixel-matching
  // it against the old full-page editor baseline.
  const dialog = page.getByRole('dialog', { name: 'Editar soporte' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cerrar' })).toBeVisible();
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize();
  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();
  if (box && viewport) {
    expect(box.width).toBeGreaterThan(0);
    expect(box.width).toBeLessThanOrEqual(viewport.width);
    expect(Math.abs(box.x + box.width - viewport.width)).toBeLessThanOrEqual(2);
    if (viewport.width < 768) {
      expect(Math.abs(box.width - viewport.width)).toBeLessThanOrEqual(2);
    } else {
      expect(box.width).toBeLessThanOrEqual(800);
    }
  }
});

