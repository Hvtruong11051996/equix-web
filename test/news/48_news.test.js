import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------48 - Check clicking Download Button ---------', () => {
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

        it('48 - Check clicking Download Button ', function (done) {
            (async () => {
                console.log('Start checking clicking Download Button ')
                const pageRows = await driver.findElements(By.css('.newsContainer .ag-body-container.ag-layout-normal > div'))
                if (pageRows.length === 0) {
                    console.log('No news')
                    done()
                } else {
                    let randomIndex = Math.floor((Math.random() * (pageRows.length - 1)) + 1);
                    const pageRow = pageRows[randomIndex]
                    const pageNumber = pageRow.findElement(By.css('.newsRowContentPage')).getText()
                    if (pageNumber === '') {
                        console.log('No page')
                        done()
                    } else {
                        await pageRow.click()
                        const download = await driver.findElements(By.css('#preview .pdfHeader > .icon:last-child'))
                        await download.click()
                        done()
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
