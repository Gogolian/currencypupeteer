import 'dotenv/config';
import request from'request';
import http from 'http';
import express from 'express';
import puppeteer from 'puppeteer'
import _ from 'lodash'

//puppeteer

let update_pairs = {};

(async function main() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const [page] = await browser.pages();

    await page.goto("https://stooq.pl/t/?i=59&v=0");
    await page.exposeFunction('puppeteerMutationListener', puppeteerMutationListener);
    await page.exposeFunction('logMe', logMe)
    await page.evaluate(() => {
      const targets = document.querySelectorAll('#f13 span[id*=_c]');

      targets.forEach((target) => {
        puppeteerMutationListener(
          target.id.substr(3, 6).toUpperCase(),
          target.textContent,
        )
      const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.target.id.substr(3, 6) !== 'plnbtc') {
            window.puppeteerMutationListener(
              mutation.target.id.substr(3, 6).toUpperCase(),
              mutation.addedNodes[0].textContent,
            );
          }
        })
      });
        observer.observe(target, { childList: true });
        
        setTimeout(() => location.reload(true), 5000)
      })

    });
  } catch (err) {
    console.error(err);
  }
})();


(async function main2() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const [page] = await browser.pages();
    
    await page.goto("https://e-kursy-walut.pl/");
    await page.exposeFunction('puppeteerMutationListener', puppeteerMutationListener);
    //await page.exposeFunction('logMe', logMe);

    await page.waitFor(2000);
    await page.evaluate(() => {
      //document.querySelector('td[title=Bitcoin]').parentNode.querySelector('.price strong').innerHTML
      const plnbtc = document.querySelector('td[title=Bitcoin]').parentNode.querySelector('.price strong')
      const plneth = document.querySelector('td[title=Ethereum]').parentNode.querySelector('.price strong')
      //logMe(plneth.textContent.match(/([0-9.]+)/g))
      const plnltc = document.querySelector('td[title=Litecoin]').parentNode.querySelector('.price strong')
      const plnxrp = document.querySelector('td[title=Ripple]').parentNode.querySelector('.price strong')
      const plnbcc = document.querySelector('td[title="Bitcoin Cash"]').parentNode.querySelector('.price strong')

      puppeteerMutationListener("PLNBTC", 1 / parseFloat(plnbtc.textContent.match(/([0-9.]+)/g)[0]))
      puppeteerMutationListener("PLNETH", 1 / parseFloat(plneth.textContent.match(/([0-9.]+)/g)[0]))
      puppeteerMutationListener("PLNLTC", 1 / parseFloat(plnltc.textContent.match(/([0-9.]+)/g)[0]))
      puppeteerMutationListener("PLNXRP", 1 / parseFloat(plnxrp.textContent.match(/([0-9.]+)/g)[0]))
      puppeteerMutationListener("PLNBCC", 1 / parseFloat(plnbcc.textContent.match(/([0-9.]+)/g)[0]))
      
      const observer = new MutationObserver(mutationsList => mutationsList.forEach(mutation => {
        window.puppeteerMutationListener("PLNBTC", 1 / parseFloat(plnbtc.textContent.match(/([0-9.]+)/g)[0]))
        window.puppeteerMutationListener("PLNETH", 1 / parseFloat(plneth.textContent.match(/([0-9.]+)/g)[0]))
        window.puppeteerMutationListener("PLNLTC", 1 / parseFloat(plnltc.textContent.match(/([0-9.]+)/g)[0]))
        window.puppeteerMutationListener("PLNXRP", 1 / parseFloat(plnxrp.textContent.match(/([0-9.]+)/g)[0]))
        window.puppeteerMutationListener("PLNBCC", 1 / parseFloat(plnbcc.textContent.match(/([0-9.]+)/g)[0]))
        }))
      observer.observe(plneth, { childList: true });

      setTimeout(() => location.reload(true), 5000)
      
    })

  } catch (err) {
    console.error(err);
  }
})();


(async function main3() {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const [page] = await browser.pages();
    
    await page.goto("https://pl.valutafx.com/PLN-AED.htm");
    await page.exposeFunction('puppeteerMutationListener', puppeteerMutationListener);

    await page.evaluate(() => {
      const plnaed = document.querySelector('.rate-value')

      puppeteerMutationListener("PLNAED", plnaed.textContent.replace(/,/g,'.').match(/([0-9.]+)/g)[0])
      
      const observer = new MutationObserver(mutationsList => mutationsList.forEach(mutation => {
        window.puppeteerMutationListener("PLNAED", plnaed.textContent.replace(/,/g,'.').match(/([0-9.]+)/g)[0])
        }))
      observer.observe(plnaed, { childList: true });

      setTimeout(() => location.reload(true), 5000)
      
    })

  } catch (err) {
    console.error(err);
  }
})();

function logMe(id) {
  console.log('logged: ', id)
}

function puppeteerMutationListener(id, newv) {

  let new_value = newv;
  if (id === 'PLNBTC') {
    new_value = 1 / parseFloat(newv);
  }

  if (update_pairs.id) {
    update_pairs.id = newv
  } else { 
    update_pairs = {...update_pairs, [id]:newv}
  }
}


//server
let app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.server = http.createServer(app);

app.get("/", (req, res) => {
  console.log("Working: ");
  console.log("req: ", req);
  res.send("working!");
});

app.get("/mainpairs.json", (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({ "timestamp": new Date().getTime(), ...update_pairs }));
});



app.server.listen(3301, () => {
  console.log(`Started on port ${app.server.address().port}`);
});
