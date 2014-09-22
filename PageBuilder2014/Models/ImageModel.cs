using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PageBuilder2014.Models
{
    public class ImageModel
    {
        public string Url { get; set; }

        public int Id { get; set; }

        public int? Width { get; set; }

        public int? Height { get; set; }
    }
}