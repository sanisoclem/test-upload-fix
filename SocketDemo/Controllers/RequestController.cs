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
using System.Transactions;

namespace SocketDemo.Controllers
{
    public class RequestController : ApiController
    {
        private SocketDemoContext db = new SocketDemoContext();

        private List<Attachment> GetRequestAttachmentMetadata(int requestId)
        {
            return (from a in db.Attachments
                    where a.RequestId == requestId
                    select new { a.FileName, a.AttachmentId }).ToList()
                                  .Select(a => new Attachment { FileName = a.FileName, AttachmentId = a.AttachmentId, RequestId = requestId }).ToList();
        }

        public IQueryable<Request> GetRequests()
        {
            return db.Requests;
        }

        [ResponseType(typeof(Request))]
        public IHttpActionResult GetRequest(int id)
        {
            Request request = db.Requests.Find(id);

            if (request == null)
                return NotFound();

            // -- retrieve attachment metadata
            request.Attachments = GetRequestAttachmentMetadata(request.RequestId);

            return Ok(request);
        }

        [ResponseType(typeof(void))]
        public IHttpActionResult PutRequest(int id, Request request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
            if (id != request.RequestId)
                return BadRequest();

            if (request.Attachments != null)
            {
                // -- compute attachment delta
                var existingAttachments = GetRequestAttachmentMetadata(id);
                var newAttachments = request.Attachments.Where(a => a.AttachmentId == 0 && a.PrepareNewAttachment(id)).ToList();
                var deletedAttachments = existingAttachments.Where(a => !request.Attachments.Any(a2 => a2.AttachmentId == a.AttachmentId)).ToList();
                if (newAttachments.Count > 0)
                    db.Attachments.AddRange(newAttachments);
                if (deletedAttachments.Count > 0)
                    deletedAttachments.ForEach(a => db.Entry(a).State = EntityState.Deleted);
                request.Attachments = null;
            }


            // -- update reuqest
            db.Entry(request).State = EntityState.Modified;

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!RequestExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return StatusCode(HttpStatusCode.NoContent);
        }

        // POST: api/Request
        [ResponseType(typeof(Request))]
        public IHttpActionResult PostRequest(Request request)
        {
            //var currentContext = HttpContext.Current;
            //if (currentContext.IsWebSocketRequest ||
            //    currentContext.IsWebSocketRequestUpgrading)
            //{
            //    currentContext.AcceptWebSocketRequest(ProcessWebsocketSession);
            //    return ResponseMessage(Request.CreateResponse(HttpStatusCode.SwitchingProtocols));
            //}

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (request.Attachments != null)
            request.Attachments.ForEach(a => a.PrepareNewAttachment());
            request.CreateDate = DateTime.Now;

            db.Requests.Add(request);
            db.SaveChanges();

            return CreatedAtRoute("DefaultApi", new { id = request.RequestId }, request);
        }

       protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool RequestExists(int id)
        {
            return db.Requests.Count(e => e.RequestId == id) > 0;
        }


        private async Task ProcessWebsocketSession(AspNetWebSocketContext context)
        {
            var ws = context.WebSocket;
            var cToken = new CancellationToken();

            ArraySegment<byte> buffer = new ArraySegment<byte>(new byte[1024 * 1024 * 4]); // -- 4mb buffer

            Request req = null;
            Dictionary<string, List<byte>> files = new Dictionary<string, List<byte>>();

            while (true)
            {
                var result = await ws.ReceiveAsync(buffer, cToken);


                if (ws.State == WebSocketState.Open)
                {
                    switch (result.MessageType)
                    {
                        case WebSocketMessageType.Text:
                            var msg = JsonConvert.DeserializeObject<WSMessage>(Encoding.UTF8.GetString(buffer.Array.Take(result.Count).ToArray()));
                            if (msg != null)
                            {
                                if (msg.Request != null)
                                    req = msg.Request;
                                if (!string.IsNullOrWhiteSpace(msg.FileName) && !string.IsNullOrWhiteSpace(msg.FilePayload))
                                {
                                    if (files.ContainsKey(msg.FileName))
                                        files.Add(msg.FileName, new List<byte>());
                                    files[msg.FileName].AddRange(Convert.FromBase64String(msg.FilePayload));
                                }

                                if (msg.MessageType == 0)
                                {
                                    if (req == null)
                                    {
                                        await ws.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes("fail")), WebSocketMessageType.Text, true, cToken);
                                        await ws.CloseAsync(WebSocketCloseStatus.InternalServerError, String.Empty, cToken);
                                        break;
                                    }

                                    try
                                    {
                                        // -- todo, calculate CRC32
                                        req.CreateDate = DateTime.Now;
                                        req.Attachments = new List<Attachment>();
                                        req.Attachments.AddRange(files.Select(a => new Attachment() { FileName = a.Key, Contents = a.Value.ToArray() }));
                                        db.Requests.Add(req);
                                        db.SaveChanges();
                                    }
                                    catch
                                    {
                                        await ws.CloseAsync(WebSocketCloseStatus.InternalServerError, String.Empty, cToken);
                                        throw;
                                    }


                                    // -- save 
                                    await ws.SendAsync(new ArraySegment<byte>(Encoding.UTF8.GetBytes("success")), WebSocketMessageType.Text, true, cToken);
                                }
                            }
                            break; 
                        case WebSocketMessageType.Binary:
                            break;
                        case WebSocketMessageType.Close:
                            await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, String.Empty, cToken);
                            break;
                    }
                }
                else
                {
                    break;
                }
            }

        }

    }

    public class WSMessage
    {
        public int MessageType { get; set; }
        public Request Request { get; set; }
        public string FileName { get; set; }
        public bool FileEOF { get; set; }
        public string FilePayload { get; set; }
    }
}