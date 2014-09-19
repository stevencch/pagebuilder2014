using HtmlAgilityPack;
using PageBuilder2014.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web;

namespace PageBuilder2014.Helper
{
    public class HtmlHelper
    {
        static StringBuilder newHtml = new StringBuilder();
        static string html = "";
        static int count = 0;
        static bool isIncrease = true;
        static NodeModel groupNode = null;
        static bool isGroup = false;
        static bool isLi = false;

        public static void Process(String inputPath, String outputPath)
        {
            int i = 0;
            string[] lines = File.ReadAllLines(inputPath);
            StringBuilder sb = new StringBuilder();
            foreach (string line in lines)
            {
                sb.Append(line);
            }
            html = sb.ToString();
            sb = new StringBuilder();
            if (i == 0)
            {
                i = html.IndexOf("<body");
            }
            newHtml.Append(html.Substring(0, i));
            SearchText(i);
            File.WriteAllText(outputPath, newHtml.ToString());

        }

        private static void SearchText(int i)
        {
            int j = html.IndexOf('>', i);
            string substring = html.Substring(i, j - i + 1);
            if (substring.StartsWith("<li"))
            {
                isLi = true;
            }
            if (substring.StartsWith("<br") || (isLi && substring.StartsWith("</li")))
            {
                isGroup = true;
            }
            if (isGroup && substring.StartsWith("</ul"))
            {
                isGroup = false;
                isLi = false;
            }
            newHtml.Append(substring);
            int k = html.IndexOf('<', j);
            if (k >= 0)
            {
                if (k - j > 1)
                {
                    string text = html.Substring(j + 1, k - j - 1).Trim();
                    if (!substring.StartsWith("<script") && text.Length > 1)
                    {
                        ReplaceText(text);
                    }
                    else
                    {
                        newHtml.Append(text);
                    }
                }
                SearchText(k);
            }
        }

        private static void ReplaceText(String text)
        {
            if (!isGroup)
            {
                count++;
            }
            else
            {
                isGroup = false;
            }

            int first = 65 + (int)(count / 26);
            int second = 65 + (count % 26);
            string replaces = new StringBuilder().Append((char)first).Append((char)second).Append(' ').ToString();
            int j = 0;
            for (int i = 0; i < text.Length; i++, j++)
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
        }

        public static NodeModel JsonConvert(string html)
        {
            NodeModel node = new NodeModel();
            HtmlDocument htmlDoc = new HtmlDocument();
            htmlDoc.LoadHtml(html);
            var root = htmlDoc.DocumentNode.SelectSingleNode("/div");
            ConvertTemplate(root, node, null);

            return node;
        }

        private static void ConvertTemplate(HtmlNode html, NodeModel node, NodeModel parent)
        {
            

            node.Type = html.Name;
            if (html.Name.Equals("#text"))
            {
                if (isIncrease)
                {
                    count++;
                    parent.Attributes.Add(new AttributeModel() { Key = "pbid", Value = GetTextKey().Substring(0, 2) });
                }
                
                //node.Content = html.InnerText;
                StringBuilder newHtml = new StringBuilder();
                int j = 0;
                for (int i = 0; i < html.InnerText.Length; i++, j++)
                {
                    if (j > GetTextKey().Length - 1)
                    {
                        j = 0;
                    }
                    newHtml.Append(GetTextKey()[j]);
                }
                if (j == 1)
                {
                    newHtml.Append(GetTextKey()[j]);
                }
                node.Content = newHtml.ToString();
                
            }
            node.Attributes = html.Attributes.Select(x => new AttributeModel() { Key = x.Name, Value = x.Value }).ToList();
            var href=node.Attributes.Where(x => x.Key.Equals("href")).FirstOrDefault();
            if (node.Type == "a" && href!=null)
            {
                href.Value = "javascript:void(0)";
            }
            node.Children = new List<NodeModel>();
            foreach (var item in html.ChildNodes)
            {
                var group = node.Attributes.Where(x => x.Key.Equals("group")).FirstOrDefault();
                if (isIncrease && group != null)
                {
                    groupNode = node;
                    isIncrease = false;
                    count++;
                    group.Value = GetTextKey().Substring(0, 2);
                    node.Attributes.Add(new AttributeModel() { Key = "pbid", Value = GetTextKey().Substring(0, 2) });
                }

                NodeModel child = new NodeModel();
                node.Children.Add(child);
                ConvertTemplate(item, child, node);
            }
            if (!isIncrease && (groupNode == node))
            {
                isIncrease = true;
            }
        }

        private static string GetTextKey()
        {
            int first = 65 + (int) (count/26);
            int second = 65 + (count%26);
            string replaces = new StringBuilder().Append((char) first).Append((char) second).Append(' ').ToString();
            return replaces;
        }
    }
}