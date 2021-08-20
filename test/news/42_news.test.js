import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------42 - Check clicking news having updated time > 20 minutes---------', () => {
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

        it('Check clicking news having updated time > 20 minutes', function (done) {
            (async () => {
                console.log('Start Check clicking news having updated time > 20 minutes')
                const pageRows = await driver.findElements(By.css('.newsContainer .ag-body-container.ag-layout-normal > div'))
                if (pageRows.length === 0) {
                    console.log('No news')
                    done()
                } else {
                    let randomIndex = Math.floor((Math.random() * (pageRows.length - 1)) + 1);
                    const pageRow = pageRows[randomIndex]
                    const titlePageRow = await pageRow.findElement(By.css('.titleContent'))
                    const titlePageRowText = await titlePageRow.getText()
                    const newsRowContentPage = await pageRow.findElement(By.css('.newsRowContentPage')).getText()
                    await pageRow.click()
                    const pdfHeader = await driver.findElement(By.css('#preview .pdfHeader'))
                    const pdfHeaderText = await pdfHeader.getText()
                    if (pdfHeaderText === titlePageRowText || pdfHeaderText === '!' + titlePageRowText) {
                        if (newsRowContentPage !== '') {
                            if (await driver.findElement(By.css('#preview .pdfContent')).getText() === 'No Attachment') {
                                console.log('No attachment')
                                done()
                            }
                        } else {
                            await driver.findElement(By.css('#preview .icon'))
                            await driver.findElement(By.css('#preview .pdfContent > iframe'))
                            console.log('Checked clicking news having updated time > 20 minutes successfully')
                            done()
                        }
                    } else {
                        console.log('Checked clicking news having updated time > 20 minutes failed')
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
