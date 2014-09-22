﻿using PageBuilder2014.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace PageBuilder2014.Controllers
{
    public class ImageController : ApiController
    {
        private const string AccountKey = "ge9khc7oHm0gvbtBr6oJXc5gOIEIi09P35d5LtfnmJo";
        public static int count = 0;
        public static string Path = System.Web.HttpContext.Current.Server.MapPath("~/");

        string market = "en-us";
        // GET api/image
        public IEnumerable<ImageModel> Get(string query, string filter, int top, int skip)
        {
            ImageController.count = 0;
            return this.Search(query, filter, top, skip).ToArray() ;
        }

        // GET api/image/5
        public string Get(int id)
        {
            return "value";
        }

        // POST api/image
        public void Post([FromBody]string value)
        {
        }

        // PUT api/image/5
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/image/5
        public void Delete(int id)
        {
        }

        private List<ImageModel> Search(string query, string filter, int top, int skip)
        {

            // Create a Bing container.
            string rootUrl = "https://api.datamarket.azure.com/Bing/Search";
            var bingContainer = new Bing.BingSearchContainer(new Uri(rootUrl));

            // Configure bingContainer to use your credentials.
            bingContainer.Credentials = new NetworkCredential(AccountKey, AccountKey);

            // Build the query, limiting to 10 results.
            var imageQuery =
                bingContainer.Image(query, null, market, "Strict", null, null, filter);
            imageQuery = imageQuery.AddQueryOption("$top", top);
            imageQuery = imageQuery.AddQueryOption("$skip", skip);

            // Run the query and display the results.
            var imageResults = imageQuery.Execute();
            List<ImageModel> searchResult = new List<ImageModel>();

            query = Regex.Replace(query, "[^A-Za-z0-9]", "_");

            int count = 0;
            foreach (Bing.ImageResult iResult in imageResults)
            {
                count++;
                searchResult.Add(new ImageModel()
                {
                    Id = count,
                    Height = iResult.Height,
                    Width = iResult.Width,
                    Url = iResult.MediaUrl
                });
            }


            if (!Directory.Exists(ImageController.Path + "/content/images/" + query))
            {
                Directory.CreateDirectory(ImageController.Path + "/content/images/" + query);
                DownloadImage(searchResult, query);
            }

            

            foreach (var item in searchResult)
            {
                item.Url = "/content/images/" + query + "/" + item.Id + ".jpg";
            }
            return searchResult;
        }


        private void DownloadImage(List<ImageModel> urls, string query)
        {
            HttpClient client = new HttpClient() { MaxResponseContentBufferSize = 1000000 };
            IEnumerable<Task> tasks = from url in urls select Download(url.Url, client, query);
            Task[] taskarray = tasks.ToArray();
            Task.WaitAll(taskarray);
        }

        private async Task Download(string url, HttpClient client, string query)
        {
            try
            {
                client.GetByteArrayAsync(url).ContinueWith(t =>
                {
                    try
                    {
                        int name = Interlocked.Increment(ref ImageController.count);
                        File.WriteAllBytes(ImageController.Path + "/content/images/" + query + "/" + name + ".jpg",
                            t.Result);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("fail1:" + ex.StackTrace);
                    }
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("fail2:" + ex.StackTrace);
            }


        }

    }
}
