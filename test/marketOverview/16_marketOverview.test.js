import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------16 - Check display of flag---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('Check login', function (done) {
            (async () => {
                await login(driver, done)
            })();
        });

        it('Open Market Overview From Menu', function (done) {
            (async () => {
                await driver.findElement(By.css('.headerBoxHover')).click();
                const itemsMenu = await driver.findElements(By.css('.menuContainer > .itemMenu'))
                await itemsMenu[1].click()
                await driver.findElement(By.css('.contentItemMenu.notLogin > .contentItemMenuRow:first-child')).click();
                done()
            })();
        });

        it('10 - Check display of flag', function (done) {
            (async () => {
                console.log('Start checking display of flag')
                const marketOverview = await driver.findElement(By.css('.mk-overview'));
                const marketOverviewWidth = await marketOverview.getCssValue('width')
                if (Number(marketOverviewWidth.replace(/\D/g, '')) > 540) {
                    await driver.sleep(2000);
                    const container = await driver.findElement(By.css('.mk-overview .ag-body-container.ag-layout-normal'));
                    await driver.sleep(1000);
                    const rows = await container.findElements(By.css('.ag-row'))
                    const row1 = await rows[0].findElements(By.css('.double-cell'))
                    const row1Src = await row1[0].findElement(By.css('img')).getAttribute('src')
                    const row2 = await rows[1].findElements(By.css('.double-cell'))
                    const row2Src = await row2[0].findElement(By.css('img')).getAttribute('src')
                    const row3 = await rows[2].findElements(By.css('.double-cell'))
                    const row3Src = await row3[0].findElement(By.css('img')).getAttribute('src')
                    const row4 = await rows[3].findElements(By.css('.double-cell'))
                    const row4Src = await row4[0].findElement(By.css('img')).getAttribute('src')
                    const row5 = await rows[4].findElements(By.css('.double-cell'))
                    const row5Src = await row5[0].findElement(By.css('img')).getAttribute('src')
                    console.log(row1Src, row2Src)
                    if ((row1Src === 'https://dev1.equixapp.com/flag/au.png') &&
                        (row2Src === 'https://dev1.equixapp.com/flag/au.png') &&
                        (row3Src === 'https://dev1.equixapp.com/flag/au.png') &&
                        (row4Src === 'https://dev1.equixapp.com/flag/au.png') &&
                        (row5Src === 'https://dev1.equixapp.com/flag/au.png')) {
                        console.log('Checked display of flag successfully')
                        done()
                    } else {
                        console.log('Checked display of flag failed')
                    }
                } else {
                    console.log('Size is < 540 px')
                    done()
                }
            })();
        });

        it('Quit App', function (done) {
            (async () => {
                await driver.quit();
                done();
            })();
        });
    } catch (error) {
    }
});
