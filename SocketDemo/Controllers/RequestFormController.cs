using System;
using System.Net.Http.Formatting;
using System.Net.Http;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Web.Http;
using System.Web.Http.Description;
using SocketDemo.Models;
using System.Web;
using System.Threading.Tasks;
using System.Web.WebSockets;
using System.Threading;
using System.Net.WebSockets;
using Newtonsoft.Json;
using System.Text;
using System.Diagnostics;
using System.IO;

namespace SocketDemo.Controllers
{
    public class RequestFormController : ApiController
    {
        private SocketDemoContext db = new SocketDemoContext();


        private List<Attachment> GetRequestAttachmentMetadata(int requestId)
        {
            return (from a in db.Attachments
                    where a.RequestId == requestId
                    select new { a.FileName, a.AttachmentId }).ToList()
                                  .Select(a => new Attachment { FileName = a.FileName, AttachmentId = a.AttachmentId, RequestId = requestId }).ToList();
        }
        private bool RequestExists(int id)
        {
            return db.Requests.Count(e => e.RequestId == id) > 0;
        }


        [HttpPut]
        //public async Task<HttpResponseMessage> Put()
        //{
        //    if (!Request.Content.IsMimeMultipartContent())
        //    {
        //        this.Request.CreateResponse(HttpStatusCode.UnsupportedMediaType);
        //    }

        //    string root = HttpContext.Current.Server.MapPath("~/temp/uploads");
        //    var provider = new MultipartFormDataStreamProvider(root);
        //    var result = await Request.Content.ReadAsMultipartAsync(provider);

        //    foreach (var key in provider.FormData.AllKeys)
        //    {
        //        foreach (var val in provider.FormData.GetValues(key))
        //        {
        //            Trace.WriteLine(key + ":" + val);
        //        }
        //    }

        //    foreach (var item in result.FileData)
        //    {
        //        var originalFileName = GetDeserializedFileName(item);
        //        var uploadedFileInfo = new FileInfo(item.LocalFileName);
        //        string path = item.LocalFileName;

        //        Trace.WriteLine("File: " + path + "(" + originalFileName + ")");
        //    }

        //    return this.Request.CreateResponse(HttpStatusCode.OK);
        //}
        public async Task<HttpResponseMessage> Put([FromUri] int id)
        {
            if (!Request.Content.IsMimeMultipartContent())
            {
                this.Request.CreateResponse(HttpStatusCode.UnsupportedMediaType);
            }

            var provider = new MultipartMemoryStreamProvider();
            var result = await Request.Content.ReadAsMultipartAsync(provider);

            Request req = null;
            Dictionary<string, byte[]> fileDictionary = new Dictionary<string, byte[]>();

            foreach (var item in result.Contents)
            {
                var name = JsonConvert.DeserializeObject<string>(item.Headers.ContentDisposition.Name).ToString();
                if (name == "$$meta$$")
                {
                    req = JsonConvert.DeserializeObject<Request>(await item.ReadAsStringAsync());
                }
                else
                {
                    fileDictionary.Add(name, await item.ReadAsByteArrayAsync());
                }
            }

            if (req == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            if (req.Attachments != null)
                req.Attachments.ForEach(a =>
                {
                    if (!string.IsNullOrEmpty(a.handle) && fileDictionary.ContainsKey(a.handle))
                        a.Contents = fileDictionary[a.handle];
                });

            if (id != req.RequestId)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            if (req.Attachments != null)
            {
                // -- compute attachment delta
                var existingAttachments = GetRequestAttachmentMetadata(id);
                var newAttachments = req.Attachments.Where(a => a.AttachmentId == 0 && a.PrepareNewAttachment(id)).ToList();
                var deletedAttachments = existingAttachments.Where(a => !req.Attachments.Any(a2 => a2.AttachmentId == a.AttachmentId)).ToList();
                if (newAttachments.Count > 0)
                    db.Attachments.AddRange(newAttachments);
                if (deletedAttachments.Count > 0)
                    deletedAttachments.ForEach(a => db.Entry(a).State = EntityState.Deleted);
                req.Attachments = null;
            }


            // -- update reuqest
            db.Entry(req).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RequestExists(id))
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }
                else
                {
                    throw;
                }
            }

            return Request.CreateResponse(HttpStatusCode.NoContent);
        }

        [HttpPost]
        public async Task<HttpResponseMessage> Post()
        {
            if (!Request.Content.IsMimeMultipartContent())
            {
                this.Request.CreateResponse(HttpStatusCode.UnsupportedMediaType);
            }

            var provider = new MultipartMemoryStreamProvider();
            var result = await Request.Content.ReadAsMultipartAsync(provider);

            Request req = null;
            Dictionary<string, byte[]> fileDictionary = new Dictionary<string, byte[]>();

            foreach (var item in result.Contents)
            {
                var name = JsonConvert.DeserializeObject<string>(item.Headers.ContentDisposition.Name).ToString();
                if (name == "$$meta$$")
                {
                    req = JsonConvert.DeserializeObject<Request>(await item.ReadAsStringAsync());
                }
                else
                {
                    fileDictionary.Add(name, await item.ReadAsByteArrayAsync());
                }
            }

            if (req == null)
                return Request.CreateResponse(HttpStatusCode.BadRequest);

            req.CreateDate = DateTime.Now;
            if (req.Attachments != null)
                req.Attachments.ForEach(a =>
                {
                    if (!string.IsNullOrEmpty(a.handle) && fileDictionary.ContainsKey(a.handle))
                        a.Contents = fileDictionary[a.handle];
                });


            db.Requests.Add(req);
            db.SaveChanges();

            return Request.CreateResponse(HttpStatusCode.NoContent);
        }

        private string GetDeserializedFileName(MultipartFileData fileData)
        {
            return GetFileName(fileData);
            //return JsonConvert.DeserializeObject(fileName).ToString();
        }

        public string GetFileName(MultipartFileData fileData)
        {
            return fileData.Headers.ContentDisposition.FileName;
        }
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

    }
}