import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------10 - Check OPEN field---------', () => {
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

        it('10 - Check OPEN field', function (done) {
            (async () => {
                console.log('Start checking OPEN field')
                const marketOverview = await driver.findElement(By.css('.mk-overview'));
                const marketOverviewWidth = await marketOverview.getCssValue('width')
                if (Number(marketOverviewWidth.replace(/\D/g, '')) > 540) {
                    await driver.sleep(2000);
                    const container = await driver.findElement(By.css('.mk-overview .ag-body-container.ag-layout-normal'));
                    await driver.sleep(1000);
                    const rows = await container.findElements(By.css('.ag-row'))
                    const row1 = await rows[0].findElements(By.css('.double-cell'))
                    const row1Text = await row1[3].getText()
                    const row2 = await rows[1].findElements(By.css('.double-cell'))
                    const row2Text = await row2[3].getText()
                    const row3 = await rows[2].findElements(By.css('.double-cell'))
                    const row3Text = await row3[3].getText()
                    const row4 = await rows[3].findElements(By.css('.double-cell'))
                    const row4Text = await row4[3].getText()
                    const row5 = await rows[4].findElements(By.css('.double-cell'))
                    const row5Text = await row5[3].getText()
                    console.log(row1Text, row2Text)
                    if (/\.\d{3}$/.test(row1Text) &&
                        /\.\d{3}$/.test(row2Text) &&
                        /\.\d{3}$/.test(row3Text) &&
                        /\.\d{3}$/.test(row4Text) &&
                        /\.\d{3}$/.test(row5Text)) {
                        console.log('Checked OPEN field successfully')
                        done()
                    } else {
                        console.log('Checked OPEN field failed')
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
