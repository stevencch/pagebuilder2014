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
            string substring = html.Substring(i, j -i+ 1);
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
                    string text = html.Substring(j + 1, k-j-1).Trim();
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
    }
}