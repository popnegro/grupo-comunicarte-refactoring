import { test, expect } from '@playwright/test';

test.describe('Grupo Comunicarte visual QA', () => {
  test('catalog view renders canonical support cards and primary CTAs', async ({ page }) => {
    await page.goto('/inventario?vista=catalogo', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).toContainText('Inventario');
    await expect(page.getByRole('button', { name: /Ver soporte/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /\+?\s*Seleccionar|En tu selección/i }).first()).toBeVisible();
    await page.screenshot({ path: 'artifacts/catalogo.png', fullPage: true });
  });

  test('featured/home experience renders', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).toContainText('Grupo Comunicarte');
    await page.screenshot({ path: 'artifacts/home.png', fullPage: true });
  });

  test('map view renders markers and closes detail with continue selecting', async ({ page }) => {
    await page.goto('/inventario?vista=mapa', { waitUntil: 'networkidle' });
    await expect(page.locator('.leaflet-container')).toBeVisible();
    const marker = page.locator('.leaflet-marker-icon').first();
    await expect(marker).toBeVisible();
    await marker.click();
    await expect(page.getByRole('button', { name: /Seguir seleccionando/i })).toBeVisible();
    await page.screenshot({ path: 'artifacts/map-detail.png', fullPage: true });
    await page.getByRole('button', { name: /Seguir seleccionando/i }).click();
    await expect(page.getByRole('button', { name: /Seguir seleccionando/i })).toHaveCount(0);
    await page.screenshot({ path: 'artifacts/map-closed.png', fullPage: true });
  });

  test('mobile inventory remains navigable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/inventario?vista=catalogo', { waitUntil: 'networkidle' });
    await expect(page.locator('body')).toContainText('Inventario');
    await expect(page.locator('body')).not.toContainText('ERROR_OVERLAY');
    await page.screenshot({ path: 'artifacts/mobile-catalogo.png', fullPage: true });
  });
});
