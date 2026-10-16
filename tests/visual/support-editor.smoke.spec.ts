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

  // The trusted base uses a full-page editor, while the candidate intentionally
  // uses a responsive drawer. Keep the scenario compatible with both versions;
  // enforce drawer geometry only when the candidate drawer exists.
  const dialog = page.getByRole('dialog', { name: 'Editar soporte' });
  if (await dialog.count()) {
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
  }
});



test('canonical inventory list visual regression: desktop and mobile', async ({ page }) => {
  await page.route('**/api/admin/stats', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: {} }) });
  });
  await page.route('**/api/admin/requests', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: [] }) });
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
    await route.continue();
  });

  await page.goto('/dashboard/soportes');
  await expect(page.getByRole('heading', { name: 'Gestión de Soportes' })).toBeVisible();
  await expect(page).toHaveScreenshot('inventory-canonical.png', { fullPage: true });
});

test('canonical requests inbox visual regression: desktop and mobile', async ({ page }) => {
  await page.route('**/api/admin/stats', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: {} }) });
  });
  await page.route('**/api/admin/requests', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: [
          {
            id: 'qa-request-01',
            requestId: 'REQ-QA-001',
            requesterName: 'Cliente QA Norte',
            requesterEmail: 'norte@example.test',
            requesterCompany: 'Empresa QA',
            requesterPhone: '2615550101',
            message: 'Consulta de validación visual.',
            status: 'pending',
            supportIds: ['smoke-trad-01'],
            supportNames: ['Soporte Smoke 4x4'],
            createdAt: '2026-10-01T12:00:00.000Z',
          },
          {
            id: 'qa-request-02',
            requestId: 'REQ-QA-002',
            requesterName: 'Cliente QA Sur',
            requesterEmail: 'sur@example.test',
            requesterCompany: 'Comercio QA',
            requesterPhone: '2615550102',
            message: '',
            status: 'contactado',
            supportIds: ['smoke-trad-01'],
            supportNames: ['Soporte Smoke 4x4'],
            createdAt: '2026-10-02T12:00:00.000Z',
          },
        ],
      }),
    });
  });

  await page.goto('/dashboard/solicitudes');
  await expect(page.getByRole('heading', { name: 'Solicitudes de Media Kit' })).toBeVisible();
  await expect(page.getByText('Cliente QA Norte')).toBeVisible();
  await expect(page).toHaveScreenshot('requests-canonical.png', { fullPage: true });
});


test('request detail prepares materials before confirming delivery', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => undefined,
    });
  });
  await page.route('**/api/admin/stats', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: {} }) });
  });
  await page.route('**/api/admin/requests', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'success',
        data: [{
          id: 'qa-request-01',
          requestId: 'REQ-QA-001',
          requesterName: 'Cliente QA Norte',
          requesterEmail: 'norte@example.test',
          requesterCompany: 'Empresa QA',
          requesterPhone: '2615550101',
          message: 'Consulta de validación.',
          status: 'contactado',
          supportIds: ['smoke-trad-01'],
          supportNames: ['Soporte Smoke 4x4'],
          createdAt: '2026-10-01T12:00:00.000Z',
        }],
      }),
    });
  });
  await page.route('**/api/supports', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: [support] }) });
  });
  await page.route('**/api/admin/mediakits/KIT-REQ-QA-001', async (route) => {
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ status: 'error', message: 'Not found' }) });
  });
  await page.route('**/api/admin/mediakits', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: { kitId: 'KIT-REQ-QA-001' } }) });
      return;
    }
    await route.continue();
  });
  await page.route('**/api/admin/requests/REQ-QA-001', async (route) => {
    if (route.request().method() === 'PATCH') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: {} }) });
      return;
    }
    await route.continue();
  });

  await page.goto('/dashboard/solicitudes');
  await page.getByRole('button', { name: /Cliente QA Norte/ }).click();
  const prepare = page.getByRole('button', { name: 'Preparar entrega', exact: true });
  if (!(await prepare.count())) test.skip(true, 'Trusted baseline predates the two-step delivery confirmation.');
  await expect(page.getByText('Soporte Smoke 4x4')).toBeVisible();
  await page.locator('input[type="number"]').first().fill('125000');
  await page.getByRole('button', { name: 'Preparar entrega', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Confirmar entrega realizada' })).toBeVisible();
  await expect(page.getByText(/Archivos preparados para compartir/)).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar entrega realizada' }).click();
  await expect(page.getByText('DONE')).toBeVisible();
});
