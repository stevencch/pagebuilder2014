﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace PageBuilder2014.Models
{
    public class PageLayout
    {
        public string pbnode { get; set; }

        public List<PageLayout> tree { get; set; }
    }
}