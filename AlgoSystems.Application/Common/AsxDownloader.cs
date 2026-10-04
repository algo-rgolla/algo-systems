using AlgoSystems.Application.Models;
using AlgoSystems.Common.Helpers;
using AlgoSystems.Domain.Entities.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Common
{
    public class AsxDownloader
    {

        //public async Task<List<string>> GetExchangeSymbolsAsync()
        //{
        //    string url = "https://www.asx.com.au/asx/research/ASXListedCompanies.csv";

        //    WebResponse response = null;
        //    Stream stream = null;
        //    StreamReader reader = null;
        //    List<string> lines = new List<string>();
        //    string line = string.Empty;

        //    try
        //    {
        //        HttpClient client = new HttpClient();
        //        stream = await client.GetStreamAsync(url);

        //        using (reader = new StreamReader(stream))
        //        {
        //            while ((line = reader.ReadLine()) != null)
        //            {
        //                lines.Add(line);
        //            }
        //        }

        //        return lines;
        //    }
        //    finally
        //    {
        //        if (response != null)
        //            response.Close();
        //    }

        //}

        //public ASXProduct GetASXProduct(ExchangeSymbol exchangeSymbol)
        //{
        //    var result = new ASXProduct();
        //    string baseUrl = "https://www.asx.com.au/asx/1/share/";
        //    DownloadHelper downloadHelper = new DownloadHelper();

        //    try
        //    {
        //        result = downloadHelper.DowloadDeserializeObject<ASXProduct>(baseUrl + exchangeSymbol.Code);
        //    }
        //    catch(Exception ex)
        //    {
        //        string message = ex.Message;
        //    }
        //    if (result == default(ASXProduct))
        //        return null;

        //    return result;
        //}

        //public ASXProductHistories GetProductHistory(string symbol, double numberOfDays)
        //{
        //    DownloadHelper downloadHelper = new DownloadHelper();

        //    string url = string.Format("https://www.asx.com.au/asx/1/share/{0}/prices?interval=daily&count={1}", symbol, numberOfDays);

        //    ASXProductHistories productHistoryData = downloadHelper.DowloadDeserializeObject<ASXProductHistories>(url);

        //    if (productHistoryData == null || productHistoryData.data == null)
        //        return null;

        //    productHistoryData.data = productHistoryData.data.OrderBy(x => x.close_date).ToList();

        //    return productHistoryData;
        //}
    }
}
