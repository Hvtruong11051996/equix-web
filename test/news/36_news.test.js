import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------36 - Check searching symbol---------', () => {
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

        it('36 - Check searching symbol', function (done) {
            (async () => {
                console.log('Start checking searching symbol')
                await driver.findElement(By.css('.newsContainer .searchVsDropdown .dropDown')).click()
                const currentOption = await driver.findElement(By.css('.newsContainer .searchVsDropdown .dropDown .list > div:last-child'))
                const currentOptionText = await currentOption.getText()

                if (currentOptionText === 'Price Sensitive') {
                    const pageRows = await driver.findElements(By.css('.newsContainer .ag-body-container.ag-layout-normal > div'))
                    if (pageRows.length === 0) {
                        console.log('No news')
                        done()
                    } else {
                        let randomIndex = Math.floor((Math.random() * (pageRows.length - 1)) + 1);
                        const pageRow = pageRows[randomIndex]
                        const dateTime = await pageRow.findElement(By.css('.newsRowContent > div:last-child'))
                        const dateTimeText = await dateTime.getAttribute('class')
                        const ALLOW_TIME = 7 * 24 * 60 * 60 * 1000
                        const currentTime = new Date().getTime()
                        if (Number(dateTimeText.slice(12) + ALLOW_TIME > currentTime)) {
                            console.log('Checked searching symbol successfully')
                            done()
                        } else {
                            console.log('Checked searching symbol failed')
                        }
                    }
                } else {
                    console.log('Checked searching symbol failed')
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
