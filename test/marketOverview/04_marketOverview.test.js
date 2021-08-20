import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------4 - Check header---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('4 - Check header', function (done) {
            (async () => {
                console.log('Start checking header')
                await driver.findElement(By.css('.headerBoxHover')).click();
                const itemsMenu = await driver.findElements(By.css('.menuContainer > .itemMenu'))
                await itemsMenu[0].click()
                const marketOverview = await driver.findElement(By.css('.contentItemMenu.notLogin > .contentItemMenuRow:first-child'));
                const marketOverviewText = await marketOverview.getText()
                if (marketOverviewText === 'Market Overview') {
                    console.log('Checked header successfully')
                    done()
                } else {
                    console.log('Checked header failed')
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
