import {test, expect} from '@playwright/test';
async function create(page, name) {
  if(await page.locator('.home-layout [data-video-mode="product"]').isVisible()) await page.locator('[data-video-mode="product"]').click();
  await page.getByRole('button', {name:'＋ Tạo dự án', exact:true}).click();
  await page.getByRole('dialog').getByRole('textbox', {name:'Tên dự án',exact:true}).fill(name);
  await page.getByRole('button', {name:'Tạo dự án',exact:true}).click();
}
async function open(page, name) { if(await page.locator('.home-layout [data-video-mode="product"]').isVisible()) await page.locator('[data-video-mode="product"]').click(); await page.getByRole('button', {name:new RegExp('^'+name)}).click(); }
test('Tạo, đổi tên, tự động lưu, đóng, mở lại và tải lại vẫn giữ dữ liệu', async ({page}) => {
  await page.goto('./');
  await create(page,'Video đầu tiên');
  await page.locator('main').getByLabel('Tên dự án', {exact:true}).fill('Tinh hoa Việt Nam');
  await page.getByLabel('Ý tưởng & kịch bản').fill('Cảnh 1: Bình minh trên cánh đồng.\nCảnh 2: Câu chuyện quê hương.');
  await expect(page.getByRole('status')).toContainText('Đã lưu');
  await page.getByRole('button',{name:'Đóng dự án'}).click();
  await open(page,'Tinh hoa Việt Nam');
  await expect(page.getByLabel('Ý tưởng & kịch bản')).toHaveValue('Cảnh 1: Bình minh trên cánh đồng.\nCảnh 2: Câu chuyện quê hương.');
  await page.reload();
  await open(page,'Tinh hoa Việt Nam');
  await expect(page.locator('main').getByLabel('Tên dự án',{exact:true})).toHaveValue('Tinh hoa Việt Nam');
  await expect(page.getByLabel('Ý tưởng & kịch bản')).toHaveValue('Cảnh 1: Bình minh trên cánh đồng.\nCảnh 2: Câu chuyện quê hương.');
});
test('Lưu thủ công và tải lại ngay trước thời gian tự động lưu', async ({page}) => {
  await page.goto('./'); await create(page,'Thủ công');
  await page.getByLabel('Ý tưởng & kịch bản').fill('Được lưu bằng nút');
  await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();
  await page.reload(); await open(page,'Thủ công');
  await expect(page.getByLabel('Ý tưởng & kịch bản')).toHaveValue('Được lưu bằng nút');
  await page.getByLabel('Ý tưởng & kịch bản').fill('Tải lại ngay lập tức');
  await page.reload(); await open(page,'Thủ công');
  await expect(page.getByLabel('Ý tưởng & kịch bản')).toHaveValue('Tải lại ngay lập tức');
});
test('Nhiều dự án độc lập, dự án cập nhật xuất hiện trước', async ({page}) => {
  await page.goto('./'); await create(page,'Một');
  await page.getByLabel('Ý tưởng & kịch bản').fill('Nội dung một');
  await create(page,'Hai');
  await page.getByLabel('Ý tưởng & kịch bản').fill('Nội dung hai');
  await open(page,'Một');
  await expect(page.getByLabel('Ý tưởng & kịch bản')).toHaveValue('Nội dung một');
  await page.getByLabel('Ý tưởng & kịch bản').fill('Nội dung một mới');
  await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();
  await expect(page.locator('#projects .project').first()).toContainText('Một');
  await page.reload(); await open(page,'Hai');
  await expect(page.getByLabel('Ý tưởng & kịch bản')).toHaveValue('Nội dung hai');
  await open(page,'Một');
  await expect(page.getByLabel('Ý tưởng & kịch bản')).toHaveValue('Nội dung một mới');
});
test('Xóa cần xác nhận, hủy giữ lại và xác nhận xóa tồn tại sau reload', async ({page}) => {
  await page.goto('./'); await create(page,'Cần xóa');
  await page.getByRole('button',{name:'Xóa dự án Cần xóa',exact:true}).click();
  await expect(page.getByRole('dialog')).toContainText('không thể hoàn tác');
  await page.getByRole('button',{name:'Hủy',exact:true}).click();
  await expect(page.locator('main').getByLabel('Tên dự án',{exact:true})).toHaveValue('Cần xóa');
  await page.getByRole('button',{name:'Xóa dự án Cần xóa',exact:true}).click();
  await page.getByRole('button',{name:'Xóa dự án',exact:true}).click();
  await expect(page.locator('#count')).toHaveText('0');
  await page.reload(); await page.locator('[data-video-mode="product"]').click(); await expect(page.locator('#count')).toHaveText('0');
});
test('Tên rỗng bị chặn và nội dung HTML được hiển thị an toàn', async ({page}) => {
  await page.goto('./'); await page.locator('[data-video-mode="product"]').click();
  await page.getByRole('button',{name:'＋ Tạo dự án',exact:true}).click();
  await page.getByRole('dialog').getByLabel('Tên dự án',{exact:true}).fill('   ');
  await page.getByRole('button',{name:'Tạo dự án',exact:true}).click();
  await expect(page.getByRole('alert')).toHaveText('Vui lòng nhập tên dự án.');
  await page.getByRole('dialog').getByLabel('Tên dự án',{exact:true}).fill('<script>alert(1)</script>');
  await page.getByRole('button',{name:'Tạo dự án',exact:true}).click();
  await expect(page.locator('#projects strong')).toHaveText('<script>alert(1)</script>');
  await page.locator('main').getByLabel('Tên dự án',{exact:true}).fill('   ');
  await page.getByLabel('Ý tưởng & kịch bản').click();
  await expect(page.locator('main').getByLabel('Tên dự án',{exact:true})).toHaveValue('Dự án chưa đặt tên');
});
test('Lỗi bộ nhớ không báo đã lưu hoặc cho đóng mất dữ liệu', async ({page}) => {
  await page.goto('./'); await create(page,'Dung lượng');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Full','QuotaExceededError'); }; });
  await page.getByLabel('Ý tưởng & kịch bản').fill('Chưa lưu được');
  await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();
  await expect(page.getByRole('status')).toContainText('Không lưu được');
  await page.getByRole('button',{name:'Đóng dự án'}).click();
  await expect(page.getByLabel('Ý tưởng & kịch bản')).toHaveValue('Chưa lưu được');
});
test('Dữ liệu hỏng được bảo toàn, không bị ghi đè', async ({page}) => {
  await page.goto('./');
  await page.evaluate(() => localStorage.setItem('tinh-hoa.projects.v1','broken'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('Dữ liệu gốc được giữ nguyên');
  await expect(page.locator('[data-video-mode]:disabled')).toHaveCount(4);
  expect(await page.evaluate(() => localStorage.getItem('tinh-hoa.projects.v1'))).toBe('broken');
});
test('Tab thứ hai không ghi đè dữ liệu đã thay đổi ở tab đầu', async ({page,context}) => {
  await page.goto('./'); await create(page,'Đa tab');
  const other = await context.newPage(); await other.goto('./'); await open(other,'Đa tab');
  await page.getByLabel('Ý tưởng & kịch bản').fill('Dữ liệu tab đầu');
  await page.getByRole('button',{name:'Lưu dự án',exact:true}).click();
  await expect(other.getByRole('status')).toContainText('tab khác');
  await other.getByLabel('Ý tưởng & kịch bản').fill('Ghi đè không được phép');
  await other.getByRole('button',{name:'Lưu dự án',exact:true}).click();
  await other.reload(); await open(other,'Đa tab');
  await expect(other.getByLabel('Ý tưởng & kịch bản')).toHaveValue('Dữ liệu tab đầu');
});
test('Laptop không tràn ngang và không gọi dịch vụ AI', async ({page}) => {
  const requests = []; page.on('request',r => requests.push(r.url()));
  await page.goto('./'); await create(page,'Laptop');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.getByRole('button',{name:'Lưu dự án',exact:true})).toBeInViewport();
  expect(requests.every(url => new URL(url).hostname === '127.0.0.1')).toBe(true);
  await page.screenshot({path:'test-results/laptop.png',fullPage:true});
});
