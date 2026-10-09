import {test,expect} from '@playwright/test';
test('Video modes open a vertical workspace and isolate project lists and restores',async({page})=>{
 await page.goto('./');await expect(page.locator('aside')).toHaveCount(0);await expect(page.locator('[data-video-mode]')).toHaveCount(4);await expect(page.locator('#new, #restore-file, #projects')).toHaveCount(0);await page.locator('[data-video-mode="text"]').click();
 await expect(page.getByRole('dialog')).not.toBeVisible();
 await expect(page.locator('.project-hub h2')).toHaveText(['Tạo dự án mới','02 Các dự án gần đây','Khôi phục dự án']);
 const overview=await page.locator('[data-tab="overview"]').boundingBox(),library=await page.locator('[data-tab="library"]').boundingBox();expect(library.y).toBeGreaterThan(overview.y);expect(library.x).toBe(overview.x);
 await expect(page.locator('[data-tab="prompts"]')).toBeDisabled();
 await page.locator('#new').click();await page.getByRole('dialog').getByLabel('Tên dự án').fill('Văn bản riêng');await page.getByRole('button',{name:'Tạo dự án',exact:true}).click();await expect(page.locator('#name')).toHaveValue('Văn bản riêng');
 const dl=page.waitForEvent('download');await page.locator('#backup').click();const file=await(await dl).path();
 await page.locator('#back-home').click();await page.locator('[data-video-mode="koc"]').click();await expect(page.locator('#count')).toHaveText('0');await expect(page.locator('#projects')).not.toContainText('Văn bản riêng');
 await page.locator('#new').click();await page.getByRole('dialog').getByLabel('Tên dự án').fill('KOC riêng');await page.getByRole('button',{name:'Tạo dự án',exact:true}).click();await expect(page.locator('#count')).toHaveText('1');
 const dialog=page.waitForEvent('dialog');await page.locator('#restore-file').setInputFiles(file);const alert=await dialog;expect(alert.message()).toContain('chọn đúng loại video');await alert.accept();await expect(page.locator('#count')).toHaveText('1');
 await page.locator('#back-home').click();await page.locator('[data-video-mode="text"]').click();await expect(page.locator('#projects')).toContainText('Văn bản riêng');await expect(page.locator('#projects')).not.toContainText('KOC riêng');await page.locator('#restore-file').setInputFiles(file);await expect(page.locator('#count')).toHaveText('2');
 await page.locator('#back-home').click();await page.locator('[data-video-mode="long"]').click();await expect(page.locator('#count')).toHaveText('0');await page.locator('#new').click();await page.getByRole('dialog').getByLabel('Tên dự án').fill('Video dài riêng');await page.getByRole('button',{name:'Tạo dự án',exact:true}).click();await page.locator('[data-tab="prompts"]').click();await expect(page.locator('[data-product="kind"]')).toHaveValue('Video dài');await expect(page.locator('[data-product="ratio"]')).toHaveValue('16:9');
});
