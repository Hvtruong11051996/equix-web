import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------8 - Check resizing widget---------', () => {
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

        it('8 - Check resizing widget', function (done) {
            (async () => {
                console.log('Start checking resizing widget')
                const marketOverview = await driver.findElement(By.css('.mk-overview'));
                const marketOverviewWidth = await marketOverview.getCssValue('width')
                if (Number(marketOverviewWidth.replace(/\D/g, '')) > 540) {
                    const container = await driver.findElements(By.css('.mk-overview .ag-header-container > .ag-header-row'))
                    const headers = await container[0].findElements(By.css('.ag-header-cell'))
                    const headerCol4 = headers[3]
                    const headerCol4Text = await headerCol4.findElement(By.css('.ag-header-cell-text')).getText()
                    const headerCol5 = headers[4]
                    const headerCol5Text = await headerCol5.findElement(By.css('.ag-header-cell-text')).getText()
                    const headerCol6 = headers[5]
                    const headerCol6Text = await headerCol6.findElement(By.css('.ag-header-cell-text')).getText()
                    if (headerCol4Text.replace(/\s/g, '') === 'OPENPREV.CLOSE' && headerCol5Text.replace(/\s/g, '') === 'HIGHLOW' && headerCol6Text.replace(/\s/g, '') === 'CLOSE') {
                        console.log('Found header columns')
                        done()
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
