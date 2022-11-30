import { Toolkit } from 'actions-toolkit'
import scrapeIt = require("scrape-it")
const { Parser } = require('json2csv')
import moment from 'moment'

interface Inputs {
  'source-url': string
  [key: string]: string
}

console.log("---------------------Get Data---------------------")

Toolkit.run<Inputs>(async tools => {
  // Prepare some options
  const sourceUrl = tools.inputs['source-url'] || 'https://www.brvm.org/en/cours-actions/0'
  // const fields = ['symbol', 'name', 'volume', 'previousPrice', 'openingPrice', 'closingPrice', 'change']

  // Promise interface Wednesday, 30 November, 2022 - 15:16
  scrapeIt(sourceUrl, {
      date: {
        selector: "#block-tools-date-maj",
        convert: date => moment(date.replace(/Last update: /g,''),'dddd, D MMMM, YYYY - HH:mm').format("YYYY-MM-DDTHH:mm")
      },
      shares: { 
        listItem: "#block-system-main > div > table > tbody > tr",
        data: {
          symbol: "td:nth-child(1)",
          name: "td:nth-child(2)",
          volume: {
            selector: "td:nth-child(3)",
            convert: volume => volume.replace(/\s/g, "")
          },
          previousPrice: {
            selector: "td:nth-child(4)",
            convert: price => price.replace(/\s/g, "")
          },
          openingPrice: {
            selector: "td:nth-child(5)",
            convert: price => price.replace(/\s/g, "")
          },
          closingPrice: {
            selector: "td:nth-child(6)",
            convert: price => price.replace(/\s/g, "")
          },
          change: {
            selector: "td:nth-child(7)",
            convert: pourcent => pourcent.replace(/,/g, '.')
          }
        }
    }
  }).then(({ data, response }) => {
      console.log(`Status Code: ${response.statusCode}`)
      const json2csvParser = new Parser({quote: ''})
      const csv = json2csvParser.parse((data as {shares: any }).shares)
      tools.outputs.csv = csv
      tools.outputs.file = (data as {date: string }).date
      console.log(tools.inputs.file)
      console.log(tools.inputs.csv)
  })

})