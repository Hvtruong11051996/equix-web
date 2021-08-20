import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------9 - Check content CURRENCIES field ---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('login success', function (done) {
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

        it('9 - Check content field CURRENCIES ', function (done) {
            (async () => {
                console.log('Start checking content CURRENCIES field')
                const marketOverview = await driver.findElement(By.css('.mk-overview'));
                const marketOverviewWidth = await marketOverview.getCssValue('width')
                if (Number(marketOverviewWidth.replace(/\D/g, '')) > 540) {
                    await driver.sleep(5000);
                    const containerMain = await driver.findElement(By.css('.mk-overview'));
                    const container = await containerMain.findElements(By.css('.ag-body-container.ag-layout-normal'));
                    await driver.sleep(1000);
                    const rows = await container[1].findElements(By.css('.ag-row'))
                    const row1 = await rows[0].findElement(By.css('.double-cell'))
                    const row1Text = await row1.getText()
                    const row2 = await rows[1].findElement(By.css('.double-cell'))
                    const row2Text = await row2.getText()
                    const row3 = await rows[2].findElement(By.css('.double-cell'))
                    const row3Text = await row3.getText()
                    if (row1Text === 'AUD/USD' && row2Text === 'GBP/USD' && row3Text === 'EUR/USD') {
                        console.log('Checked content CURRENCIES field successfully')
                        done()
                    } else {
                        console.log('Checked content CURRENCIES field failed')
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
