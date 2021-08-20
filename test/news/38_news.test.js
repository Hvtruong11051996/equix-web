import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------38 - Check searching symbol/random news title---------', () => {
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

        it('Check searching symbol/random news title', function (done) {
            (async () => {
                console.log('Start checking searching symbol/random news title')
                await driver.findElement(By.css('.newsContainer .searchVsDropdown .dropDown')).click()
                const currentOption = await driver.findElement(By.css('.newsContainer .searchVsDropdown .dropDown .list > div:first-child'))
                const currentOptionText = await currentOption.getText()

                if (currentOptionText === 'All') {
                    const inputSearch = await driver.findElement(By.css('.newsContainer .input-filter'))
                    await inputSearch.sendKeys('BHP')
                    console.log('Checked searching symbol/random news title successfully')
                    done()
                } else {
                    console.log('Checked searching symbol/random news title failed')
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
