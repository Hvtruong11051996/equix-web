import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------33 - Check search box---------', () => {
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

        it('Check opening news from menu', function (done) {
            (async () => {
                await driver.findElement(By.css('.headerBoxHover')).click();
                await driver.findElement(By.css('.menuContainer > div:nth-child(4)')).click();
                await driver.findElement(By.css('div.contentItemMenu.notLogin > div:nth-child(2)')).click();
                await driver.sleep(1000);
                await driver.findElement(By.css('.newsContainer'))
                done();
            })();
        });

        it('Check search box', function (done) {
            (async () => {
                console.log('Start checking search box')
                const search = await driver.findElement(By.css('.newsContainer .inputAddon:nth-child(2) .placeHolder'))
                const searchText = await search.getText()
                const searchCssColor = await search.getCssValue('color')
                const button = await driver.findElement(By.css('.newsContainer .inputAddon:nth-child(2) .button'))
                const buttonText = await button.getText()
                if (searchText === 'Search' && searchCssColor === 'rgba(153, 153, 153, 1)' && buttonText === 'Go') {
                    console.log('Checked search box successfully')
                    done()
                } else {
                    console.log('Checked search box failed')
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
