import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('../config');
let driver;

describe('----------25 Check loading Icon when click----------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });
        it('Check loading Icon when click', function (done) {
            (async () => {
                console.log('Check loading Icon when click start >>>>>>>')
                const marketOverview = await driver.findElement(By.css('.mk-overview'));
                const marketOverviewWidth = await marketOverview.getCssValue('width')
                if (Number(marketOverviewWidth.replace(/\D/g, '')) > 540) {
                    console.log(39)
                    await driver.sleep(2000);
                    const container = await driver.findElement(By.css('.mk-overview .ag-body-container.ag-layout-normal'));
                    console.log(container)
                    await driver.sleep(1000);
                    const rows = await container.findElements(By.css('.ag-row'))
                    console.log(rows)
                    var x = Math.floor((Math.random() * 5) + 0);
                    await rows[x].findElement(By.css('.double-cell')).click();
                    await driver.findElement(By.css('.lm_tab[title="Market_Overview"] .loading-white'));
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
