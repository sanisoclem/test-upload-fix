using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace SocketDemo.Models
{
    public class Request
    {
        public int RequestId { get; set; }
        public string Subject { get; set; }
        public string CreatedBy { get; set; }
        public DateTime CreateDate { get; set; }
        public bool Locked { get; set; }

        public List<Attachment> Attachments { get; set; }
    }

    public class Attachment
    {
        public int AttachmentId { get; set; }
        public string FileName { get; set; }
        public byte[] Contents { get; set; }

        public int RequestId { get; set; }


        [NotMapped]
        public string ContentsBase64 { get; set; }
        [NotMapped]
        public string handle { get; set; }

        public bool PrepareNewAttachment(int? requestId = null)
        {
            if (requestId.HasValue)
                RequestId = requestId.Value;

            if (Contents != null)
                return true;

            if (string.IsNullOrWhiteSpace(ContentsBase64))
                return false;
            try
            {
                Contents = Convert.FromBase64String(ContentsBase64);
                ContentsBase64 = null;
                
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}