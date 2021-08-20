import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------28 - Check Update Time---------', () => {
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

        it('28 - Check Update Time', function (done) {
            (async () => {
                console.log('Start checking Update Time')
                const pageRows = await driver.findElements(By.css('.newsContainer .ag-body-container.ag-layout-normal > div'))
                if (pageRows.length === 0) {
                    console.log('No news')
                    done()
                } else {
                    const pageRow = await driver.findElement(By.css('.newsContainer .ag-body-container.ag-layout-normal > div'))
                    const dateTimeDiv = await pageRow.findElement(By.css('.newsRowContent > div:last-child'))
                    const dateTimeDivText = await dateTimeDiv.getText()
                    if (/\d+ (minute|minutes|hour|hours) ago/.test(dateTimeDivText)) {
                        console.log('Checked Update Time successfully')
                        done()
                    } else {
                        console.log('Checked Update Time failed')
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
