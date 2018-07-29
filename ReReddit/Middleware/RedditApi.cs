using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;

namespace ReReddit.Middleware
{
    public class RedditApi : IMiddleware
    {
        const string REDDIT_API = "https://oauth.reddit.com";

        private HttpClient client;

        public RedditApi()
        {
            client = new HttpClient();
            client.BaseAddress = new Uri(REDDIT_API);
        }

        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            if (!context.Request.Path.Value.StartsWith("/api/"))
            {
                await next(context);
                return;
            }

            var method = HttpMethod.Get;

            if (context.Request.Method == "POST")
                method = HttpMethod.Post;

            //get path
            var sourcePath = context.Request.Path.ToString();
            var path = sourcePath.Remove(sourcePath.IndexOf("/api"), 4);
            var request = new HttpRequestMessage(method, REDDIT_API + path);

            //get auth token
            var auth = context.Request.Headers.FirstOrDefault(m => m.Key == "Authorization");
            if (auth.Key != null)
                request.Headers.Add("Authorization", auth.Value[0]);

            //set user agent
            var userAgent = context.Request.Headers.FirstOrDefault(m => m.Key == "User-Agent");
            request.Headers.Add("User-Agent", userAgent.Value[0]);

            //set body data
            var reader = new StreamReader(context.Request.Body);
            var body = await reader.ReadToEndAsync();
            var formData = HttpUtility.ParseQueryString(body);
            var values = new Dictionary<string, string>();

            foreach (var v in formData.AllKeys)
                values[v] = formData.Get(v);

            var r = new FormUrlEncodedContent(values);
            request.Content = r;

            //send req
            var result = await client.SendAsync(request);
            context.Response.StatusCode = (int)result.StatusCode;
            var resultBody = await result.Content.ReadAsStringAsync();
            await context.Response.WriteAsync(resultBody);

        }
    }
}
