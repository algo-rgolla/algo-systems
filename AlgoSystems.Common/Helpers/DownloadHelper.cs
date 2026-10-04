using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Net;
using Newtonsoft.Json;
using System.Net.Http;

namespace AlgoSystems.Common.Helpers
{
    public class DownloadHelper
    {

        public List<T> DeserializeList<T>(string data)
        {
            return JsonConvert.DeserializeObject<List<T>>(data);
        }
        public T Deserialize<T>(string data)
        {
            if (data == null)
                return default(T);
            try
            {
                return JsonConvert.DeserializeObject<T>(data);

            }
            catch
            {
                return default(T);

            }
        }

        public T DowloadDeserializeObject<T>(string url)
        {
            return Deserialize<T>(DownloadHtmlPage(url));
        }
        public List<T> DowloadDeserializeObjects<T>(string url)
        {
            return DeserializeList<T>(DownloadHtmlPage(url));
        }

        public string DownloadHtmlPage(string requestUrl)
        {
            WebResponse response = null;
            Stream stream = null;
            StreamReader reader = null;
            string buffer = string.Empty;

            try
            {

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(requestUrl);
                response = request.GetResponse();

                using (stream = response.GetResponseStream())
                {
                    using (reader = new StreamReader(stream))
                    {
                        buffer = reader.ReadToEnd();
                    }
                }

                return buffer;
            }
            catch
            {
                return null;
            }
            finally
            {
                if (response != null)
                    response.Close();
            }
        }

        //public List<string> DownloadHtmlPageAsLines(string requestUrl)
        //{
        //    WebResponse response = null;
        //    Stream stream = null;
        //    StreamReader reader = null;
        //    List<string> lines = new List<string>();
        //    string line = string.Empty;

        //    try
        //    {

        //        HttpWebRequest request = (HttpWebRequest)WebRequest.Create(requestUrl);
        //        response = request.GetResponse();

        //        using (stream = response.GetResponseStream())
        //        {
        //            using (reader = new StreamReader(stream))
        //            {
        //                while ((line = reader.ReadLine()) != null)
        //                {
        //                    lines.Add(line);
        //                }
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

        public async Task<List<string>> DownloadAsxWebPageAsLines(string requestUrl)
        {
            WebResponse response = null;
            Stream stream = null;
            StreamReader reader = null;
            List<string> lines = new List<string>();
            string line = string.Empty;

            try
            {
                HttpClient client = new HttpClient();
                stream = await client.GetStreamAsync(requestUrl);

                using (reader = new StreamReader(stream))
                {
                    while ((line = reader.ReadLine()) != null)
                    {
                        lines.Add(line);
                    }
                }

                return lines;
            }
            finally
            {
                if (response != null)
                    response.Close();
            }

        }

        public string DownloadCSV(string requestUrl)
        {
            WebResponse response = null;
            Stream stream = null;
            StreamReader reader = null;
            string buffer = string.Empty;
            string line = string.Empty;

            try
            {

                HttpWebRequest request = (HttpWebRequest)WebRequest.Create(requestUrl);
                response = request.GetResponse();

                using (stream = response.GetResponseStream())
                {
                    using (reader = new StreamReader(stream))
                    {
                        while ((line = reader.ReadLine()) != null)
                        {
                            buffer += line + "\r\n";
                        }
                    }
                }

                return buffer;
            }
            //catch (WebException e) {
            //    // if this is a 404 and its flagged as OK we need to throw to the calling method which will handle it
            //    if ((this._NotFound404ErrorIsOK == true) && (e.ToString().Contains("404")))
            //        throw e;

            //    //System.Console.WriteLine("Can't download:" + " ERROR!"); //e.ToString());
            //    if (String.IsNullOrEmpty(this._requestUriString))
            //        ServiceLayer.Logging.DatabaseLog.WriteCrawlerServiceErrorEntry(_dataFileTaskId, e);
            //    else {
            //        ServiceLayer.Logging.DatabaseLog.WriteErrorEntry(_dataFileTaskId, "Request URI=" + this._requestUriString, e);
            //    }
            //    return null;
            //}
            //catch (IOException e) {
            //    //System.Console.WriteLine("Can't download:" + " ERROR!"); //e.ToString());
            //    if (String.IsNullOrEmpty(this._requestUriString))
            //        ServiceLayer.Logging.DatabaseLog.WriteCrawlerServiceErrorEntry(_dataFileTaskId, e);
            //    else {
            //        ServiceLayer.Logging.DatabaseLog.WriteErrorEntry(_dataFileTaskId, "Request URI=" + this._requestUriString, e);
            //    }
            //    return null;
            //}
            finally
            {
                if (response != null)
                    response.Close();
            }
        }
    }
}
