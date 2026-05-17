using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Data;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Middleware;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register application services (scoped = one instance per request)
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<ClientService>();
builder.Services.AddScoped<ParameterService>();
builder.Services.AddScoped<TransactionService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize enums as strings (like Java does by default with @Enumerated(STRING))
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// CORS configuration (equivalent to Java CorsFilter)
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddOpenApi();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Apply pending migrations and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.Migrate();
    AuthDataSeeder.SeedDefaultUser(context);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Exception handling middleware (equivalent to Java ExceptionMappers)
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
