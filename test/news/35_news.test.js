import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------35 - Search symbols with no news---------', () => {
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

        it('35 - Search symbols with no news', function (done) {
            (async () => {
                console.log('Start searching symbols with no news')
                await driver.findElement(By.css('.newsContainer .searchVsDropdown .dropDown')).click()
                const currentOption = await driver.findElement(By.css('.newsContainer .searchVsDropdown .dropDown .list > div:first-child'))
                const currentOptionText = await currentOption.getText()

                if (currentOptionText === 'All') {
                    const pageRows = await driver.findElements(By.css('.newsContainer .ag-body-container.ag-layout-normal > div'))
                    if (pageRows.length === 0) {
                        console.log('No news')
                        await driver.findElements(By.css('.newsContainer .ag-overlay-wrapper.ag-overlay-no-rows-wrapper.ag-layout-normal'))
                        done()
                    } else {
                        done()
                    }
                } else {
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
