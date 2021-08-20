import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------43 - Check clicking outside pdf file or back button---------', () => {
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

        it('Check clicking outside pdf file or back button', function (done) {
            (async () => {
                console.log('Start checking clicking outside pdf file or back button')
                const pageRows = await driver.findElements(By.css('.newsContainer .ag-body-container.ag-layout-normal > div'))
                if (pageRows.length === 0) {
                    console.log('No news')
                    done()
                } else {
                    let randomIndex = Math.floor((Math.random() * (pageRows.length - 1)) + 1);
                    const pageRow = pageRows[randomIndex]
                    await pageRow.click()
                    await driver.findElement(By.css('#closePDFFull')).click()
                    const preview = await driver.findElements(By.css('#preview'))
                    if (preview.length === 0) {
                        console.log('Checked clicking outside pdf file or back button successfully')
                        done()
                    } else {
                        console.log('Checked clicking outside pdf file or back button failed')
                    }
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
