using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Remoting.Channels;
using System.Text;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Http;
using PageBuilder2014.Helper;
using PageBuilder2014.Models;

namespace PageBuilder2014.Controllers
{
    public class PageController : ApiController
    {
        private StringBuilder sbBegin = new StringBuilder();
        // GET: api/Page
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET: api/Page/5
        public string Get(int id)
        {
            return "value";
        }

        // POST: api/Page
        public void Post(PageLayout pageLayout)
        {

            string file1 =
                HttpContext.Current.Server.MapPath("~/templates/t1/mypage.html");
            GeneratePage(pageLayout,file1);

        }

        private void GeneratePage(PageLayout pageLayout,string file)
        {
            String page = File.ReadAllText(HttpContext.Current.Server.MapPath("~/content/templates/t1/html/home/p1.html"));
            ProcessLayout(pageLayout);
            using (StreamWriter sw = new StreamWriter(file))
            {
                string html = sbBegin.ToString() ;
                var node = HtmlHelper.JsonConvert(html);
                string json = Newtonsoft.Json.JsonConvert.SerializeObject(node);
                string script = @"<script> var pagejson=" + json + ";</script>";
                page = page.Replace("[[PAGE]]", script+"\r\n"+node.ToString());
                sw.Write(page);
            }
        }

        private void ProcessLayout(PageLayout pageLayout)
        {
            switch (pageLayout.pbnode)
            {
                case "root":
                    sbBegin.Append("<div class='root'>");
                    break;
                case "c12":
                    sbBegin.Append("<div class='row'>");
                    break;
                case "c6a":
                case "c6b":
                    sbBegin.Append("<div class='col-md-6'>");
                    break;
                case "c4a":
                case "c4b":
                case "c4c":
                    sbBegin.Append("<div class='col-md-4'>");
                    break;
                case "c8a":
                case "c8b":
                    sbBegin.Append("<div class='col-md-8'>");
                    break;
                default:
                    string html = File.ReadAllText(HttpContext.Current.Server.MapPath("~/content/templates/t1/html/home/"+pageLayout.pbnode+".html"));
                    sbBegin.Append(CleanUp(html));
                    break;
            }
            foreach (var item in pageLayout.tree)
            {
                ProcessLayout(item);
                if (!item.pbnode.StartsWith("s"))
                {
                    sbBegin.Append("</div>");
                }
            }
        }

        private string CleanUp(string html)
        {
            html = Regex.Replace(html, "<!--.*-->", "");
            html = Regex.Replace(html, @"\r\n", "");
            html = Regex.Replace(html, "[ ]+<", "<");
            html = Regex.Replace(html, ">[ ]+", ">");
            return html;
        }

        // PUT: api/Page/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE: api/Page/5
        public void Delete(int id)
        {
        }
    }
}
