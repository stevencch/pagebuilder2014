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
        static string html = "";
        static int count = 0;
        static int imageCount = 0;
        static bool isIncrease = true;
        static NodeModel groupNode = null;
        static bool isGroup = false;
        static bool isLi = false;

        public static NodeModel JsonConvert(string html)
        {
            NodeModel node = new NodeModel();
            HtmlDocument htmlDoc = new HtmlDocument();
            HtmlNode.ElementsFlags.Remove("form");
            htmlDoc.LoadHtml(html);
            HtmlHelper.count = 0;
            HtmlHelper.imageCount = 0;
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

                var attr = parent.Attributes.Where(x => x.Key.Equals("isedit")).FirstOrDefault();
                if ((attr == null || !attr.Value.Equals("true")) && parent.Type == "script" && parent.Type == "style")
                {
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
                else
                {
                    node.Content = html.InnerText;
                }

            }
            node.Attributes = html.Attributes.Select(x => new AttributeModel() { Key = x.Name, Value = x.Value }).ToList();
            var href=node.Attributes.Where(x => x.Key.Equals("href")).FirstOrDefault();
            var hrefskip = node.Attributes.Where(x => x.Key.Equals("hrefskip")).FirstOrDefault();
            if (node.Type == "a" && href != null && hrefskip==null)
            {
                href.Value = "javascript:void(0)";
            }
            if (node.Type == "img")
            {
                imageCount++;
                node.Attributes.Add(new AttributeModel() { Key = "imgid", Value = imageCount.ToString() });
            }
            var bgimage = node.Attributes.Where(x => x.Key.Equals("bgimage")).FirstOrDefault();
            if (bgimage != null)
            {
                imageCount++;
                node.Attributes.Add(new AttributeModel() { Key = "imgid", Value = imageCount.ToString() });
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

        internal static string ProcessSettings(NodeModel node, List<PageLayoutSetting> list)
        {
            
            foreach(var item in list){
                isFound = false;
                foundNode = null;
                FindNode(node, "pbkey", item.key);
                if (foundNode != null)
                {
                    if (item.key.StartsWith("repeat"))
                    {
                        int count = Convert.ToInt32(item.value);
                        int childCount = foundNode.Children.Count();
                        List<NodeModel> newChildren=new List<NodeModel>();
                        int j = 0;
                        for (int i = 0; i < count; i++)
                        {
                            newChildren.Add(foundNode.Children[j].Clone() as NodeModel);
                            j++;
                            if (j > childCount-1)
                            {
                                j = 1;
                            }
                        }
                        foundNode.Children = newChildren;
                    }
                }
            }
            return node.ToString();
        }

        private static bool isFound = false;
        private static NodeModel foundNode =null;
        static void FindNode(NodeModel node, string keyName, string key)
        {
            if (node.Attributes.Where(x => x.Key == keyName && x.Value==key).Count() > 0)
            {
                foundNode = node;
                isFound = true;
            }
            if (!isFound)
            {
                foreach (var child in node.Children)
                {
                    FindNode(child,keyName, key);
                    if (isFound)
                    {
                        break;
                    }
                }
            }
        }
    }
}