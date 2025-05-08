using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);



// Configurar el servicio de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:5173") // Dirección del frontend 
               .AllowAnyMethod() // Permitir todos los métodos HTTP (GET, POST, etc.)
               .AllowAnyHeader(); // Permitir todos los encabezados HTTP
    });
});

// Add services to the container.

builder.Services.AddDbContext<ChChatarra40Context>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<UsuarioDAO>();
builder.Services.AddScoped<CategoriaDAO>();
builder.Services.AddScoped<ProductosDAO>();
builder.Services.AddScoped<TiendaDAO>();
builder.Services.AddScoped<VendedorDAO>();
builder.Services.AddScoped<FavoritosDAO>();
builder.Services.AddScoped<CarritoDAO>();
builder.Services.AddScoped<RenseniaProductoDAO>();
builder.Services.AddScoped<VentaDAO>();


builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseCors("CorsPolicy");
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();