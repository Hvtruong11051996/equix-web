import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------29 - Check sort news by time---------', () => {
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

        it('29 - Check sort news by time', function (done) {
            (async () => {
                console.log('Start checking sort news by time')
                const pageRows = await driver.findElements(By.css('.newsContainer .ag-body-container.ag-layout-normal > div'))
                if (pageRows.length < 2) {
                    console.log('No news to sort')
                    done()
                } else {
                    let randomIndex = Math.floor((Math.random() * (pageRows.length - 1)) + 1);
                    const pageRow = pageRows[randomIndex]
                    const dateTimeDiv = await pageRow.findElement(By.css('.newsRowContent > div:last-child'))
                    const dateTimeDivText = await dateTimeDiv.getAttribute('class')

                    const nextPageRow = pageRows[randomIndex + 1]
                    const dateTimeNextDiv = await nextPageRow.findElement(By.css('.newsRowContent > div:last-child'))
                    const dateTimeNextDivText = await dateTimeNextDiv.getAttribute('class')
                    if (Number(dateTimeDivText.slice(12) < Number(dateTimeNextDivText.slice(12)))) {
                        console.log('Checked sort news by time successfully')
                        done()
                    } else {
                        console.log('Checked sort news by time failed')
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
