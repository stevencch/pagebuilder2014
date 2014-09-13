using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using PageBuilder2014.Models;

namespace PageBuilder2014.Controllers
{
    public class PageController : ApiController
    {
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
