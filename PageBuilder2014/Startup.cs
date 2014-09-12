using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(PageBuilder2014.Startup))]
namespace PageBuilder2014
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
