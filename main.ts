import dotenv from 'dotenv';
import { chromium } from 'playwright';
dotenv.config();

const main = async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://share.timescar.jp/view/member/mypage.jsp');
  await page.locator('#cardNo1').fill(process.env.TIMES_ID_1!);
  await page.locator('#cardNo2').fill(process.env.TIMES_ID_2!);
  await page.locator('#tpPassword').fill(process.env.TIMES_PASSWORD!);
  await page.locator('#doLoginForTp').click();

  await page.goto('https://share.timescar.jp/view/station/search.jsp');
  await page.waitForLoadState('networkidle');
  await page.locator('#monthAdvanceBooking').click();
  await page.locator('#optionNarrowWord').fill('東京');
  await page.locator('#doOptionSearch').click();
  await page.waitForLoadState('networkidle');

  let availableList: Array<string> = [];

  while ((await page.locator('#goNext').count()) > 0) {
    for (const a of (await page.locator('#goReserve').all())) {
      await a.click();
      await page.waitForLoadState('networkidle');

      console.log('====================');
      console.log(await page.locator('#stationNm').first().textContent());
      console.log(page.url());

      if ((await page.locator('option[value=P1]').count()) > 0) {
        console.log('プレミアムあり');
        await page.locator('select#dateStartSearch').selectOption('2023-08-13 00:00:00.0');
        await page.locator('select#dateEndSearch').selectOption('2023-08-15 00:00:00.0');
        await page.locator('.searchCar > a').first().click();

        const availability = await page
          .locator('.classAvail')
          .filter({ hasText: 'プレミアム' })
          .first()
          .locator('.carModelUnspecified')
          .first()
          .textContent();
        console.log(availability);
        if (availability?.includes('空きあり')) {
          console.log('プレミアム空きあり！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！');
          availableList.push(await page.locator('#stationNm').first().textContent() ?? '');
        }
      } else {
        console.log('プレミアムなし');
      }
      await page.goBack();
    }
    await page.locator('#goNext').first().click();
    await page.waitForLoadState('networkidle');
    console.log(page.url());
  }

  console.log(availableList);

  await browser.close();
};

main();
