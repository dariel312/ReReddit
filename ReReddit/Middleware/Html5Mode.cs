using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ReReddit.Middleware
{
    public class Html5mode : IMiddleware
    {
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            await next(context);
            if (context.Response.StatusCode == 404 &&
               !Path.HasExtension(context.Request.Path.Value) &&
               !context.Request.Path.Value.StartsWith("/api/"))
            {
                context.Request.Path = "/";
                context.Response.StatusCode = 200;
                await next(context);
            }
        }
    }
}
