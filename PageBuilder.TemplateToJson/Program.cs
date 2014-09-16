using HtmlAgilityPack;
using Newtonsoft.Json;
using PageBuilder2014.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace PageBuilder.TemplateToJson
{ 
    class Program
    {
        public static int count = 0;
        static void Main(string[] args) 
        {
            for (int i = 1; i <= 1; i++)
            {
                string str = i.ToString();
                if (i < 10)
                {
                    str = "0" + str;
                }
                NodeModel node = new NodeModel();
                HtmlDocument htmlDoc = new HtmlDocument();
                htmlDoc.Load(@"D:\Development\cch\pagebuilder\src\PageBuilder2014\Content\templates\t1\html\home\s01"+str+".html");
                var root = htmlDoc.DocumentNode.SelectSingleNode("/div");
                ConvertTemplate(root, node,null);
                string json = JsonConvert.SerializeObject(node);
                File.WriteAllText(@"D:\Development\cch\pagebuilder\src\PageBuilder2014\Content\templates\t1\html\home\s01" + str + ".json", json);
                File.WriteAllText(@"D:\Development\cch\pagebuilder\src\PageBuilder2014\Content\templates\t1\html\home\s01" + str + "_new.html", node.ToString());
            }
        }

        private static void ConvertTemplate(HtmlNode html, NodeModel node, NodeModel parent)
        {
            node.Type = html.Name;
            if (html.Name.Equals("#text"))
            {
                
                int first = 65 + (int)(count / 26);
                int second = 65 + (count % 26);
                string replaces = new StringBuilder().Append((char)first).Append((char)second).Append(' ').ToString();
                count++;
                //node.Content = html.InnerText;
                StringBuilder newHtml = new StringBuilder();
                int j = 0;
                for (int i = 0; i < html.InnerText.Length; i++, j++)
                {
                    if (j > replaces.Length - 1)
                    {
                        j = 0;
                    }
                    newHtml.Append(replaces[j]);
                }
                if (j == 1)
                {
                    newHtml.Append(replaces[j]);
                }
                node.Content = newHtml.ToString();
                parent.Attributes.Add(new AttributeModel() { Key = "tId", Value = replaces.Substring(0, 2) });
            }
            node.Attributes = html.Attributes.Select(x => new AttributeModel() { Key = x.Name, Value = x.Value }).ToList();
            node.Children = new List<NodeModel>();
            foreach (var item in html.ChildNodes)
            {
                NodeModel child = new NodeModel();
                node.Children.Add(child);
                ConvertTemplate(item, child,node);
            }
        }
    }
}