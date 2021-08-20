const { By, until } = require('selenium-webdriver');
const { config, builder } = require('./../config');
let driver;

describe('----------False-Pin-Test---------', () => {
    try {
        it('Start App', function (done) {
            driver = builder();
            (async () => {
                await driver.navigate().to(config.domain);
                console.log('go to domain')
                await driver.wait(until.elementLocated(By.css('body')));
                await driver.sleep(1000);
                done();
            })();
        });

        it('Test Enter Username and Password Successfully', function (done) {
            (async () => {
                console.log('Find login button')
                await driver.wait(until.elementLocated(By.css(`.loginButton`)))
                console.log('Find login button success')

                console.log('Click login button')
                await driver.sleep(1000);
                await driver.findElement(By.css('.loginButton')).click();
                await driver.wait(until.elementLocated(By.css(`#userNameInput`)))
                await driver.sleep(100);
                await driver.findElement(By.css('#userNameInput')).sendKeys(config.username);
                await driver.wait(until.elementLocated(By.css(`#passwordInput`)))
                await driver.sleep(100);
                await driver.findElement(By.css('#passwordInput')).sendKeys(config.password);
                await driver.wait(until.elementLocated(By.css(`#loginButton`)))
                await driver.sleep(100);
                await driver.findElement(By.css('#loginButton')).click();
                console.log('Click login button success')

                console.log('Check login status')
                await driver.sleep(2000);
                await driver.wait(until.elementLocated(By.css(`.pinFormRoot`)))
                console.log('Logged in successfully')
                done();
            })();
        });

        it('Test Enter False Pin', function (done) {
            (async () => {
                console.log('Find pin component')
                await driver.wait(until.elementLocated(By.css(`.pinFormRoot`)))
                console.log('Find pin component success')

                console.log('Enter pin')
                await driver.findElement(By.css('.pinFormRoot input')).sendKeys(config.false_pin);
                await driver.sleep(2000);
                await driver.wait(until.elementLocated(By.css(`.pinFormRoot`)))
                console.log('Entered pin incorrectly')
                done();
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
