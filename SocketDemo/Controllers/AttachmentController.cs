using SocketDemo.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;

namespace SocketDemo.Controllers
{
    public class AttachmentController : ApiController
    {
        private SocketDemoContext db = new SocketDemoContext();

        public IHttpActionResult Get(int id)
        {
            var attachment = db.Attachments.SingleOrDefault(a => a.AttachmentId == id);
            if (attachment == null)
                return NotFound();

            HttpResponseMessage result = new HttpResponseMessage(HttpStatusCode.OK);

            var mem = new MemoryStream(attachment.Contents);

            result.Content = new StreamContent(mem);
            result.Content.Headers.ContentType = new MediaTypeHeaderValue("applicaiton/octet-stream");
            result.Content.Headers.ContentDisposition = new ContentDispositionHeaderValue("attachment")
            {
                FileName = attachment.FileName
            };

            return ResponseMessage(result);

        }
    }
}
