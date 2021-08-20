import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------09 - Check flag display---------', () => {
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

        it('Check flag display', function (done) {
            (async () => {
                console.log('Start checking flag display')
                const img = await driver.findElement(By.css('.newsContainer .inputAddon .flag > img'))
                const imgSrc = await img.getAttribute('src')
                const symbolInput = await driver.findElement(By.css('.newsContainer .inputAddon > input'))
                const symbolInputValue = await symbolInput.getAttribute('value')
                console.log(imgSrc, symbolInputValue)
                if (imgSrc === 'https://dev1.equixapp.com/flag/au.png' && /\.ASX$/.test(symbolInputValue)) {
                    console.log('Checked flag display successfully')
                    done()
                } else if (imgSrc === 'https://dev1.equixapp.com/flag/us.png' && /\.NASDAD$/.test(symbolInputValue)) {
                    console.log('Checked flag display successfully')
                    done()
                } else {
                    console.log('Checked flag display failed')
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
