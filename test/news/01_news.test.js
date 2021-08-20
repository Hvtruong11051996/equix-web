import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------1 - Check news display---------', () => {
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

        it('1 - Check news display', function (done) {
            (async () => {
                console.log('Starting checking news display')
                await driver.findElement(By.css('.headerBoxHover')).click();
                await driver.findElement(By.css('.menuContainer > div:nth-child(4)')).click();
                await driver.findElement(By.css('div.contentItemMenu.notLogin > div:nth-child(2)')).click();
                await driver.sleep(1000);
                const newsComponent = await driver.findElement(By.css('.lm_tab[title="News"]'))
                const title = await newsComponent.findElement(By.css('.lm_title')).getText()
                if (title === 'News') {
                    console.log('Checked news display successfully')
                    done()
                } else {
                    console.log('Checked news display failed')
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
