import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------3 - Check position of market overview in menu---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
            })();
        });

        it('3 - Check position of market overview in menu', function (done) {
            (async () => {
                console.log('Start checking position of market overview in menu')
                await driver.findElement(By.css('.headerBoxHover')).click();
                const itemsMenu = await driver.findElements(By.css('.menuContainer > .itemMenu'))
                await itemsMenu[0].click()
                await driver.findElement(By.css('.contentItemMenu.notLogin > .contentItemMenuRow:first-child'));
                await driver.findElement(By.css('.contentItemMenu.notLogin > .contentItemMenuRow:last-child'));
                done()
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
