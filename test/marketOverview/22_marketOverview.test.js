import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------9 - Check flag CURRENCIES field ---------', () => {
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

        it('9 - Check flag CURRENCIES field ', function (done) {
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
                    const rowflag1 = await rows[0].findElements(By.css('.double-cell .rootFlag .rootFlag .divFlag'))
                    const flag11 = await rowflag1[0].findElement(By.css('.flag img'))
                    const flag12 = await rowflag1[1].findElement(By.css('.flag img'))
                    const flag21 = await rowflag1[0].findElement(By.css('.flag img'))
                    if (flag11.getAttribute('src') === '/flag/au.png' && flag12.getAttribute('src') === '/flag/us.png' &&
                        flag21.getAttribute('src') === '/flag/gb.png' && flag21.getAttribute('src') === '/flag/us.png' &&
                        flag21.getAttribute('src') === '../img/flags/flag_eur.svg' && flag21.getAttribute('src') === '/flag/us.png') {
                        console.log('Checked flag CURRENCIES field successfully')
                        done()
                    } else {
                        console.log('Checked flag CURRENCIES field failed')
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
