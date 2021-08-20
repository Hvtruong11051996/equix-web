import { login, startApp } from '../helper/functionUtils';

const { By } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------3 - Check default status of Icons---------', () => {
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

        it('3 - Check default status of Icons', function (done) {
            (async () => {
                await driver.sleep(1000);
                const newsComponent = await driver.findElement(By.css('.lm_tab[title="News"]'))
                const iconLink = await newsComponent.findElement(By.css('img[src="img/link-variant.svg"]'))
                const iconLinkCssDisplay = await iconLink.getCssValue('display')
                if (iconLinkCssDisplay === 'block') {
                    console.log('Check default status of Icons successfully')
                    done();
                } else {
                    console.log('Check default status of Icons failed')
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
