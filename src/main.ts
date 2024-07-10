import axios from 'axios';
import { CheerioCrawler } from 'crawlee';

const crawler = new CheerioCrawler();


// categories  ['groepenkasten', 'groepenkast-componenten', 'schakelmateriaal', 'installatiemateriaal', 'draad-en-kabel','laadpaal', 'elektrabuizen','bevestiging','verlichting','netwerk-internet','gereedschap', 'zonnepaneel-materiaal', 'ucht-en-ventilatie', 'water-aanvoer-afvoer', 'verwarming-en-koeling' ]
 



crawler.router.addDefaultHandler(async ctx => {
    await ctx.enqueueLinks({
        globs: ['https://www.elektramat.nl/elektrabuizen/**'],
        label: 'detail'
    });

    await ctx.enqueueLinks({
        globs: ['https://www.elektramat.nl/draad-en-kabel/**'],
        label: 'wires'
    });
});


//-----------------method to scrape pdp links from listing page--------------------//
async function enqueuePdpLinks(ctx, selector, label) {
    const links = ctx.$(selector).find('a');
    const pdpLinks = links.map((index, element) => ctx.$(element).attr('href')).get();
    
    for (const link of pdpLinks) {
        if (link) {
            await crawler.addRequests([{
                url: link,
                userData: { label: 'PDP' }
            }]);
        }
    }
}


//----------------crawling category-------------//
crawler.router.addHandler('detail', async (ctx) => {
    await enqueuePdpLinks(ctx, '.item.product.product-item', 'detail');
});


//-------------- crawling category-------------//
crawler.router.addHandler('wires', async (ctx) => {
    await enqueuePdpLinks(ctx, '.item.product.product-item', 'wires');
});





//-------------- scraping pdp page---------//
crawler.router.addHandler('PDP', async (ctx) => {
    ctx.log.info(`${ctx.request.loadedUrl} doing it `)

    const html = ctx.body.toString();

    const data = {
        url: ctx.request.loadedUrl,
        html: html,
        is_scrapped: true
    };
 //await sendDataToEndpoint(data);

})



// await crawler.exportData('final.json')

async function sendDataToEndpoint(data) {

    // console.log(data)
    const endpoint = 'https://v7.dev.getdemo.dev/eu24-web-mock-api/develop/public/api/scrapers/crawled/pages';

    try {
        const response = await axios.post(endpoint, data, {
            headers: {
                'Content-Type': 'application/json',
                
            }
        });
        console.log('Data sent successfully:', response);
    } catch (error) {
        console.error('Error sending data:');
    }
}

(async () => {
    await crawler.run(['https://www.elektramat.nl']);
})();
