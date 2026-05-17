using Microsoft.EntityFrameworkCore;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Parameter> Parameters { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Store enums as strings
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(e => e.Username).IsUnique();
                entity.Property(e => e.Role).HasConversion<string>().HasMaxLength(10);
                entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(10);
            });

            modelBuilder.Entity<Client>(entity =>
            {
                entity.HasIndex(e => e.Dni).IsUnique();
                entity.HasIndex(e => e.UserId).IsUnique();
                entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(10);
                entity.HasOne(e => e.User)
                      .WithOne(u => u.Client)
                      .HasForeignKey<Client>(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Account>(entity =>
            {
                entity.HasIndex(e => e.AccountNumber).IsUnique();
                entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(10);
                entity.Property(e => e.Type).HasConversion<string>().HasMaxLength(10);
                entity.HasOne(e => e.Client)
                      .WithMany()
                      .HasForeignKey(e => e.ClientId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.Property(e => e.Type).HasConversion<string>().HasMaxLength(10);
                entity.Property(e => e.TransferType).HasConversion<string?>().HasMaxLength(10);
                entity.HasOne(e => e.SourceAccount)
                      .WithMany()
                      .HasForeignKey(e => e.SourceAccountId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.TargetAccount)
                      .WithMany()
                      .HasForeignKey(e => e.TargetAccountId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Parameter>(entity =>
            {
                entity.HasIndex(e => e.Key).IsUnique();
            });
        }
    }
}
