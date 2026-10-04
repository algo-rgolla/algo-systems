using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Models
{
    public class Company
    {
        public string symbolDisplay { get; set; }
    }

    public class CompanyInfo
    {
        public string symbol { get; set; }
        public string xid { get; set; }
        public int ASXSecurityType { get; set; }
        public string displayName { get; set; }
        public string issueType { get; set; }
        public string issueTypeName { get; set; }
        public int issueTypeCode { get; set; }
        public string isin { get; set; }
        public int xidEntity { get; set; }
        public string sector { get; set; }
        public string industryGroup { get; set; }
        public string industry { get; set; }
        public string subIndustry { get; set; }
    }

    public class Item
    {
        public List<string> announcementTypes { get; set; }
        public List<Company> companies { get; set; }
        public List<CompanyInfo> companyInfo { get; set; }
        public DateTime date { get; set; }
        public string documentKey { get; set; }
        public string fileSize { get; set; }
        public string headline { get; set; }
        public bool isPriceSensitive { get; set; }
        public string symbol { get; set; }
        public List<string> symbolsSecondary { get; set; }
        public string url { get; set; }
    }

    public class SummaryCounts
    {
        public int total { get; set; }
        public int priceSensitive { get; set; }
    }

    public class Data
    {
        public List<Item> items { get; set; }
        public int count { get; set; }
        public SummaryCounts summaryCounts { get; set; }
    }

    public class Root
    {
        public Data data { get; set; }
    }

}
