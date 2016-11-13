namespace SocketDemo.Migrations
{
    using System;
    using System.Data.Entity.Migrations;
    
    public partial class Initial : DbMigration
    {
        public override void Up()
        {
            CreateTable(
                "dbo.Attachments",
                c => new
                    {
                        AttachmentId = c.Int(nullable: false, identity: true),
                        FileName = c.String(),
                        Contents = c.Binary(),
                        RequestId = c.Int(nullable: false),
                    })
                .PrimaryKey(t => t.AttachmentId)
                .ForeignKey("dbo.Requests", t => t.RequestId, cascadeDelete: true)
                .Index(t => t.RequestId);
            
            CreateTable(
                "dbo.Requests",
                c => new
                    {
                        RequestId = c.Int(nullable: false, identity: true),
                        Subject = c.String(),
                        CreatedBy = c.String(),
                        CreateDate = c.DateTime(nullable: false),
                        Locked = c.Boolean(nullable: false),
                    })
                .PrimaryKey(t => t.RequestId);
            
        }
        
        public override void Down()
        {
            DropForeignKey("dbo.Attachments", "RequestId", "dbo.Requests");
            DropIndex("dbo.Attachments", new[] { "RequestId" });
            DropTable("dbo.Requests");
            DropTable("dbo.Attachments");
        }
    }
}
