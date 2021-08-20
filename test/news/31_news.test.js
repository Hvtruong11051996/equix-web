import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------31 - Check filter---------', () => {
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

        it('31 - Check filter', function (done) {
            (async () => {
                console.log('Start checking filter')
                await driver.findElement(By.css('.newsContainer .searchVsDropdown .dropDown')).click()
                const list = await driver.findElement(By.css('.newsContainer .searchVsDropdown .list'))
                const list1 = list.findElement(By.css('div:first-child'))
                const list1Text = await list1.getText()
                const list2 = list.findElement(By.css('div:last-child'))
                const list2Text = await list2.getText()
                if (list1Text === 'All' && list2Text === 'Price Sensitive') {
                    console.log('Checked filter successfully')
                    done()
                } else {
                    console.log('Checked filter failed')
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
