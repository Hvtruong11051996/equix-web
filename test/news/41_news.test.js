import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------41 - Check searching symbol/random news title---------', () => {
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
                console.log('Start Check searching symbol/random news title')
                await driver.findElement(By.css('.newsContainer .searchVsDropdown .dropDown')).click()
                const currentOption = await driver.findElement(By.css('.newsContainer .searchVsDropdown .dropDown .list > div:last-child'))
                const currentOptionText = await currentOption.getText()

                if (currentOptionText === 'Price Sensitive') {
                    const inputSearch = await driver.findElement(By.css('.newsContainer .input-filter'))
                    await inputSearch.sendKeys('asdf23523df')
                    await driver.findElement(By.css('.newsContainer .ag-overlay-wrapper.ag-overlay-no-rows-wrapper.ag-layout-normal'))
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
