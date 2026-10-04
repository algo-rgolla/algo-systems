using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace AlgoSystems.Common.Helpers
{
    public static class AnnouncementHtmlPageHelper
    {
        /// <summary>
        /// Download a HTML Page and place all lines into a buffer of string array.
        /// </summary>
        /// <param name="requestUri">The request URI is the URI to use for download</param>
        /// <returns>An HTML Page in a string array</returns>
        public static List<string> GetLinesFromHtmlPage(string requestUri)
        {
            DownloadHelper downloadHelper = new DownloadHelper();
            return downloadHelper.DownloadAsxWebPageAsLines(requestUri).Result;
        }

        /// <summary>
        /// Checks if the announcement line is empty of just contains TAB or other specials
        /// </summary>
        /// <param name="line">Input line ot check</param>
        /// <returns>TRUE if the line contains nothing useful.</returns>
        public static bool IsAnnouncementLineEmpty(string line)
        {
            // line is empty on Tab-only, empty string, special chars only, etc.
            return (string.IsNullOrWhiteSpace(line) ||
                string.IsNullOrWhiteSpace(line.Trim().Replace("\t", string.Empty)));
        }
        public static string GetASXCode(string line)
        {
            return line.ToString().Replace("</td>", string.Empty).Replace(">", string.Empty);
        }

        /// <summary>
        /// Gets the document date from the Html input line.
        /// </summary>
        /// <param name="line">The document date html line, see remarks for sample.</param>
        /// <remarks>
        /// A sample line is:
        /// 
        /// </remarks>
        /// <returns>A DateTime representing the document date</returns>
        public static DateTime GetDocumentDate(string line)
        {
            return Convert.ToDateTime(line.ToString().Replace("</td>", string.Empty).Replace(">", string.Empty).Replace("</span", "").Replace("<br", "").Replace("<span class=\"dates-time\"", " "));
        }

        /// <summary>
        /// Checks if the line contains an image for Price Sensitivty or not.
        /// </summary>
        /// <param name="line">The Price Sensitive Html line, see remarks for sample</param>
        /// <remarks>
        /// A sample line is:
        /// 
        /// </remarks>
        /// <returns>TRUE if Price Sensitive, FALSE otherwise</returns>
        public static bool GetIsPriceSensitive(string line)
        {
            return line.Contains("pricesens") ? true : false;
        }

        /// <summary>
        /// Getst the Headline Description text from the Html line.
        /// </summary>
        /// <param name="line">Input line see Remarks for sample</param>
        /// <remarks>Each line will come into this function similar to:
        ///  <td><astyle=\"text-decoration: none;\" target=\"_blank\"href=\"/asx/statistics/displayAnnouncement.do?display=pdf&idsId=02050946\">Results of 2018 AGM<br><img src=\"/images/pdf_icon.png\" height=\"16\" width=\"16\"></img><span class=\"page\">3pages</span><span class=\"filesize\">649.8KB</span></a></td>
        /// </remarks>
        /// <returns></returns>
        public static string GetHeadlineDescription(string line)
        {
            string headlineDescription = string.Empty;
            int idxBRtag = line.IndexOf("<br");
            string startSubstring = line.Substring(0, idxBRtag); // the first <br> tag is at the end of the Description text
            int idxLastGreaterThanTag = line.Substring(0, idxBRtag).LastIndexOf(">") + 1;  // the portion from the end of the Description text backwards to the > tag

            headlineDescription = startSubstring.Substring(idxLastGreaterThanTag);
            // remove any HTML characters
            headlineDescription = HttpUtility.HtmlDecode(headlineDescription).Trim();

            return headlineDescription;
        }

        /// <summary>
        /// Gets the Number Of Pages for the Announcement, to help user decide if they need to download/read it.
        /// </summary>
        /// <param name="line">Input line see Remarks for sample</param>
        /// <remarks>Each line will come into this function similar to:
        ///  <td><astyle=\"text-decoration: none;\" target=\"_blank\"href=\"/asx/statistics/displayAnnouncement.do?display=pdf&idsId=02050946\">Results of 2018 AGM<br><img src=\"/images/pdf_icon.png\" height=\"16\" width=\"16\"></img><span class=\"page\">3pages</span><span class=\"filesize\">649.8KB</span></a></td>
        /// </remarks>
        /// <returns>0 on error otherwise a numerical value indicating number of pages.</returns>
        public static short GetNumberOfPages(string line)
        {
            short numberOfPages = 0;

            try
            {
                int idxTrailingText = line.ToString().IndexOf("pages</span");
                if(idxTrailingText == -1)
                {
                    idxTrailingText = line.ToString().IndexOf("page</span");
                }
                string startingTextMinusTrailingText = line.Substring(0, idxTrailingText);
                // get just the number of pages which is immediately after that last > character
                numberOfPages = Convert.ToInt16(startingTextMinusTrailingText.Substring(startingTextMinusTrailingText.LastIndexOf(">") + 1));

                //numberOfPages = Convert.ToInt16(line.Substring(0, line.ToString().IndexOf("pages</span")).Substring(line.Substring(0, line.ToString().IndexOf("pages</span")).LastIndexOf(">") + 1));
            }
            catch
            {
                // any error just set to 0 (possibly we may get "-" as value)
                numberOfPages = 0;
            }

            return numberOfPages;
        }

        /// <summary>
        /// Gets the IsPDF Format indicator from the Html line input.
        /// </summary>
        /// <param name="line">The Html line containing is PDF indicator</param>
        /// <returns>TRUE if is PDF format, FALSE otheriwse</returns>
        public static bool GetIsPDFFormat(string line)
        {
            // if the url contains the text "PDF" then it is in the PDF format
            return line.Contains("display=pdf") ? true : false;
        }

        /// <summary>
        /// Gets the PDF URL link from within the tag containing the getAnnPdf function call contained on the ASX page.
        /// </summary>
        /// <remarks>Each line will come into this function similar to:
        ///  <td><astyle=\"text-decoration: none;\" target=\"_blank\"href=\"/asx/statistics/displayAnnouncement.do?display=pdf&idsId=02050946\">Results of 2018 AGM<br><img src=\"/images/pdf_icon.png\" height=\"16\" width=\"16\"></img><span class=\"page\">3pages</span><span class=\"filesize\">649.8KB</span></a></td>
        /// </remarks>
        /// <param name="pdfLinkData">input line from announcements HTML</param>
        /// <returns>URL such as: http://www.asx.com.au/asx/statistics/displayAnnouncement.do?display=pdf&idsId=02050946</returns>
        public static string GetAnnouncementPDFlink(string pdfLinkPrefix, string pdfLinkData)
        {
            try
            {
                string idFindString = "idsId=";
                int idxIdsId = pdfLinkData.IndexOf(idFindString);
                string startAnnouncementPdfText = pdfLinkData.Substring(idxIdsId);
                string announcementId = startAnnouncementPdfText.Substring(0, pdfLinkData.Substring(idxIdsId).IndexOf("\""));
                announcementId = announcementId.Substring(idFindString.Length);

                // construct the announcement PDF link:
                return pdfLinkPrefix.Trim() + announcementId.Trim();
            }
            catch
            {
                //LoggingHelper.LogException(ex);
                return string.Empty;
            }
        }
    }
}
