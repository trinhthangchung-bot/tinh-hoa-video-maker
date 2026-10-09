import { test, expect } from '@playwright/test';

async function create(page, name) {
  if(await page.locator('.home-layout [data-video-mode="product"]').isVisible()) await page.locator('[data-video-mode="product"]').click();
  await page.locator('[data-hub-tab=\"new\"]').click();await page.getByRole('button', { name: '＋ Tạo dự án', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Tên dự án').fill(name);
  await page.getByRole('button', { name: 'Tạo dự án', exact: true }).click();
}
async function library(page) {
  await page.getByRole('button', { name: 'Nhân vật & Bối cảnh', exact: true }).click();
}
const image = {
  name: 'san-pham.png', mimeType: 'image/png',
  buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a0d8AAAAASUVORK5CYII=', 'base64'),
};

test('Thư viện ảnh: tải lên, phân loại, đổi tên, mở lại và xóa', async ({ page }) => {
  await page.goto('./'); await create(page, 'Thư viện'); await library(page);
  await page.locator('#asset-files').setInputFiles(image);
  await expect(page.locator('.asset-card')).toHaveCount(1);
  await page.getByLabel('Tên ảnh').fill('Nhân vật chính');
  await page.getByLabel('Tên ảnh').press('Tab');
  await page.locator('[data-asset-type]').selectOption('character');
  await expect(page.locator('[data-asset-type]')).toHaveValue('character');
  await page.reload();await page.locator('[data-video-mode="product"]').click();
  await page.getByRole('button', { name: /^Thư viện/ }).click(); await library(page);
  await expect(page.getByLabel('Tên ảnh')).toHaveValue('Nhân vật chính');
  await expect(page.locator('[data-asset-type]')).toHaveValue('character');
  await page.getByRole('button', { name: 'Sản phẩm', exact: true }).click();
  await expect(page.locator('.asset-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Nhân vật', exact: true }).click();
  await expect(page.locator('.asset-card')).toHaveCount(1);
  page.once('dialog', d => d.accept());
  await page.locator('[data-delete-asset]').click();
  await expect(page.locator('.asset-card')).toHaveCount(0);
  await page.reload();await page.locator('[data-video-mode="product"]').click();
  await page.getByRole('button', { name: /^Thư viện/ }).click(); await library(page);
  await expect(page.locator('.asset-card')).toHaveCount(0);
});

test('Form, ảnh tham chiếu, câu lệnh và hàng đợi video giữ dữ liệu sau reload', async ({ page }) => {
  await page.goto('./'); await create(page, 'Nội dung'); await library(page);
  await page.locator('#asset-files').setInputFiles(image);
  await expect(page.locator('.asset-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Prompt / Câu lệnh', exact: true }).click();
  await page.locator('[data-product="name"]').fill('Trà Tinh Hoa');
  await page.locator('[data-product="description"]').fill('Trà xanh thơm dịu');
  await page.getByRole('button', { name: '✦ Tạo bản nháp câu lệnh', exact: true }).click();
  await expect(page.locator('.prompt-card')).toHaveCount(5);
  await expect(page.getByLabel('Câu lệnh cảnh 1')).toContainText('Trà Tinh Hoa');
  const ref = page.locator('[data-refs]').first();
  await ref.locator('summary').click();
  await ref.getByRole('checkbox').check();
  await expect(ref.locator('.ref-selected img')).toHaveCount(1);
  await page.getByRole('button', { name: 'Đánh dấu sẵn sàng', exact: true }).first().click();
  await page.locator('[data-tab=\"overview\"]').click();await page.getByRole('button', { name: 'Video', exact: true }).click();
  await page.getByRole('button', { name: '＋ Đưa cảnh sẵn sàng vào', exact: true }).click();
  await expect(page.locator('.video-card')).toHaveCount(1);
  await page.locator('[data-video-file]').setInputFiles('tests/fixtures/clip.webm');
  await expect(page.locator('.video-card')).toContainText('clip.webm');
  await page.reload();await page.locator('[data-video-mode="product"]').click();
  await page.getByRole('button', { name: /^Nội dung/ }).click();
  await page.getByRole('button', { name: /^Prompt \/ Câu lệnh/ }).click();
  await expect(page.locator('[data-product="name"]')).toHaveValue('Trà Tinh Hoa');
  await expect(page.locator('.prompt-card')).toHaveCount(5);
  await expect(page.locator('[data-refs]').first().locator('.ref-selected img')).toHaveCount(1);
  await page.getByRole('button', { name: 'Thu gọn cảnh 1' }).click();
  await expect(page.getByLabel('Câu lệnh cảnh 1')).toBeHidden();
  await page.waitForTimeout(500);
  await page.reload();await page.locator('[data-video-mode="product"]').click();
  await page.getByRole('button', { name: /^Nội dung/ }).click();
  await page.getByRole('button', { name: /^Prompt \/ Câu lệnh/ }).click();
  await expect(page.getByRole('button', { name: 'Mở rộng cảnh 1' })).toBeVisible();
  await page.locator('[data-tab=\"overview\"]').click();await page.getByRole('button', { name: 'Video', exact: true }).click();
  await expect(page.locator('.video-card')).toContainText('clip.webm');
});
