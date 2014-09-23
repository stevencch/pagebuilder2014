using System;
using System.Collections.Generic;
using System.Data.Entity.Core.Objects;
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
        private StringBuilder sbHtml = new StringBuilder();
        private NodeModel foundNode = null;
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
        [Route("api/page")]
        public void Post(PageLayout pageLayout)
        {

            string file1 =
                HttpContext.Current.Server.MapPath("~/templates/t1/mypage.html");
            GeneratePage(pageLayout, file1);

        }

        // POST: api/Page
        [Route("api/page/save")]
        public void SavePage(NodeModel node)
        {
            HttpContext.Current.Application["Node"] = node;
            string file =
                HttpContext.Current.Server.MapPath("~/templates/t1/finalpage.html");
            GenerateFinalPage(node, file);

        }

        // POST: api/Page
        [Route("api/page/new")]
        public void NewPage()
        {
            HttpContext.Current.Application["Node"] = null;
            HttpContext.Current.Application["Layout"] = null;
        }

        // POST: api/Page
        [Route("api/page/reload")]
        public PageLayout ReloadPage()
        {
            var result = HttpContext.Current.Application["Layout"] as PageLayout;
            return result;

        }

        private void GenerateFinalPage(NodeModel node, string file)
        {
            String page = File.ReadAllText(HttpContext.Current.Server.MapPath("~/content/templates/t1/html/home/p2.html"));
            using (StreamWriter sw = new StreamWriter(file))
            {
                page = page.Replace("[[PAGE]]", node.ToString());
                sw.Write(page);
            }
        }

        private void GeneratePage(PageLayout pageLayout, string file)
        {
            String page = File.ReadAllText(HttpContext.Current.Server.MapPath("~/content/templates/t1/html/home/p1.html"));
            HttpContext.Current.Application["Layout"] = pageLayout;
            ProcessLayout(pageLayout);
            using (StreamWriter sw = new StreamWriter(file))
            {
                string html = sbHtml.Append("</div>").ToString();
                var node = HtmlHelper.JsonConvert(html);
                string json = Newtonsoft.Json.JsonConvert.SerializeObject(node);
                //NodeModel newNode = Newtonsoft.Json.JsonConvert.DeserializeObject<NodeModel>(json);
                string script = @"<script> var pagejson=" + json + ";</script>";
                page = page.Replace("[[PAGE]]", script + "\r\n" + node.ToString());
                sw.Write(page);
            }
        }

        private void ProcessLayout(PageLayout pageLayout)
        {
            switch (pageLayout.pbnode)
            {
                case "root":
                    sbHtml.Append("<div class='root' uid='-99'>");
                    break;
                case "c12":
                    sbHtml.Append("<div class='row' uid='-12'>");
                    break;
                case "c6a":
                case "c6b":
                    sbHtml.Append("<div class='col-md-6' uid='-6'>");
                    break;
                case "c4a":
                case "c4b":
                case "c4c":
                    sbHtml.Append("<div class='col-md-4' uid='-4'>");
                    break;
                case "c8a":
                case "c8b":
                    sbHtml.Append("<div class='col-md-8' uid='-8'>");
                    break;
                default:
                    string html = File.ReadAllText(HttpContext.Current.Server.MapPath("~/content/templates/t1/html/home/" + pageLayout.pbnode + ".html"));

                    if (HttpContext.Current.Application["Node"] != null)
                    {
                        NodeModel node = HttpContext.Current.Application["Node"] as NodeModel;
                        foundNode = null;
                        FindNode(node, pageLayout.uid);
                    }
                    if (foundNode != null)
                    {
                        sbHtml.Append(foundNode.ToString());
                    }
                    else
                    {
                        sbHtml.Append("<div class=\"node\" uid=\"" + pageLayout.uid + "\">");
                        sbHtml.Append(CleanUp(html));
                        sbHtml.Append("</div>");
                    }


                    break;
            }
            foreach (var item in pageLayout.tree)
            {
                ProcessLayout(item);
                if (!item.pbnode.StartsWith("s"))
                {
                    sbHtml.Append("</div>");
                }
            }
        }

        private void FindNode(NodeModel node, string uid)
        {
            var mynode = node.Attributes.Where(x => x.Key == "uid" && x.Value == uid).FirstOrDefault();
            if (mynode != null)
            {
                foundNode = node;
                return;
            }
            else
            {
                foreach (var child in node.Children)
                {
                    FindNode(child, uid);
                    if (foundNode != null)
                    {
                        break;
                    }
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
