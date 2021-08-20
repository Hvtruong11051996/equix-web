import { login, startApp } from '../helper/functionUtils';
import { canDownloadNew } from './../../src/helper/functionUtils';
const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');

let driver;

async function getSymbolFromSearchBox() {
    const text = await driver.findElement(By.css('.newsHeader .nodeSearchBox input')).getText()
    console.log(text)
    await driver.findElement(By.css('.newsHeader .nodeSearchBox input')).sendKeys('BHP')
    await driver.findElement(By.css('.newsHeader .nodeSearchBox .button')).click();
}

describe('----------08 - Check News Title---------', () => {
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

        it('Check News Title', function (done) {
            (async () => {
                console.log('Start checking News Title')
                await getSymbolFromSearchBox()
                await driver.sleep(2000);
                const pageRows = await driver.findElements(By.css('.newsContainer .ag-body-container.ag-layout-normal > div'))
                if (pageRows.length === 0) {
                    console.log('No news')
                    done()
                } else {
                    let randomIndex = Math.floor((Math.random() * (pageRows.length - 1)) + 1);
                    const pageRow = pageRows[randomIndex]
                    const rowNewsDownloadButton = await pageRow.findElement(By.css('svg'))
                    const rowNewsDownloadButtonColor = await rowNewsDownloadButton.getCssValue('fill')
                    const rowNewsDate = await pageRow.findElement(By.css('.newsRowContent > div:last-child'))
                    const rowNewsDateClass = await rowNewsDate.getAttribute('class')
                    const timeAgo = rowNewsDateClass.slice(12)
                    console.log(timeAgo, canDownloadNew(Number(timeAgo)), rowNewsDownloadButtonColor)
                    if ((canDownloadNew(Number(timeAgo)) && rowNewsDownloadButtonColor === 'rgb(53, 158, 228)')) {
                        console.log('Check News Title successfully')
                        done()
                    } else {
                        console.log('Check News Title failed')
                    }
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
