import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------12 - Check number of pages---------', () => {
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

        it('12 - Check number of pages', function (done) {
            (async () => {
                console.log('Start checking number of pages')
                const pageRows = await driver.findElements(By.css('.newsContainer .ag-body-container.ag-layout-normal > div'))
                if (pageRows.length === 0) {
                    console.log('No news')
                    done()
                } else {
                    const pageRow = await driver.findElement(By.css('.newsContainer .ag-body-container.ag-layout-normal > div'))
                    const newsRowContentPage = await pageRow.findElement(By.css('.newsRowContentPage'))
                    const newsRowContentPageText = await newsRowContentPage.getText()
                    if (/\d+ Page/.test(newsRowContentPageText)) {
                        console.log('Checked number of pages successfully')
                        done()
                    } else {
                        console.log('Checked number of pages failed')
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
