using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace PageBuilder2014.Controllers
{
    public class ImageController : ApiController
    {
        private const string AccountKey = "ge9khc7oHm0gvbtBr6oJXc5gOIEIi09P35d5LtfnmJo";
        public static int count=0;

        string market = "en-us";
        // GET api/image
        public IEnumerable<string> Get(string query, string filter, int top, int skip)
        {
            return this.Search(query, filter, top, skip);
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

        private string[] Search(string query, string filter, int top, int skip)
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
            List<string> searchResult = new List<string>();

            foreach (Bing.ImageResult iResult in imageResults)
            {
                searchResult.Add(iResult.MediaUrl);
            }

            DownloadImage(searchResult);

            return searchResult.ToArray();
        }

        private async void DownloadImage(List<string> urls )
        {
            HttpClient client = new HttpClient() { MaxResponseContentBufferSize = 1000000 };
            IEnumerable<Task> tasks = from url in urls select Download(url,client);
            Task[] taskarray = tasks.ToArray();
            await Task.WhenAll(taskarray);
        }

        private async Task Download(string url, HttpClient client)
        {
            try
            {
                byte[] byteArray = await client.GetByteArrayAsync(url);
                int name = Interlocked.Increment(ref ImageController.count);
                File.WriteAllBytes(HttpContext.Current.Server.MapPath("~/content/images/" + name + ".jpg"), byteArray);
            }
            catch (Exception ex)
            {
                
            }
        }

    }
}
