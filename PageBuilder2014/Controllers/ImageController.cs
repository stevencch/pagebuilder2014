using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;

namespace PageBuilder2014.Controllers
{
    public class ImageController : ApiController
    {
        private const string AccountKey = "ge9khc7oHm0gvbtBr6oJXc5gOIEIi09P35d5LtfnmJo";

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

            return searchResult.ToArray();
        }
    }
}
