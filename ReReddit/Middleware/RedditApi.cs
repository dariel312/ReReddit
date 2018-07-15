using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace ReReddit.Middleware
{
    public class RedditApi
    {
        private readonly RequestDelegate _next;
        private HttpClient client;
        const string API = "https://oauth.reddit.com";

        public RedditApi(RequestDelegate next)
        {
            _next = next;
            client = new HttpClient();

        }
        public async Task Invoke(HttpContext context)
        {
            if (!context.Request.Path.Value.StartsWith("/api/"))
            {
                await _next(context);
                return;
            }

            var method = HttpMethod.Get;

            if (context.Request.Method == "POST")
                method = HttpMethod.Post;

            var req = new HttpRequestMessage(method, API + context.Request.Path);
            req.Headers.Add("Authorization", context.Request.Headers.First(m => m.Key == "Authorization").Value.ToString());
            var result = await client.SendAsync(req);

        }
    }
}
