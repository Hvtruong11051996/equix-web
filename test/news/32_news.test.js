import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------32 - Check default filter---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await startApp(driver, done)
                done();
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

        it('32 - ', function (done) {
            (async () => {
                console.log('Start checking default filter')
                await driver.findElement(By.css('.newsContainer .searchVsDropdown .dropDown')).click()
                const list = await driver.findElement(By.css('.newsContainer .searchVsDropdown .activeDropDown'))
                const listText = await list.getText()
                if (listText === 'All') {
                    console.log('Checked default filter successfully')
                    done()
                } else {
                    console.log('Checked default filter failed')
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
