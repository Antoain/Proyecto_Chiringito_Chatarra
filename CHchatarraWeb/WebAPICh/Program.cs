using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.Models;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using System.Text;

using WebAPICh.Services;


var builder = WebApplication.CreateBuilder(args);


// ==========================================
// CONFIGURACIÓN DE CORS
// ==========================================

builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});


// ==========================================
// CONFIGURACIÓN DE BASE DE DATOS
// ==========================================

builder.Services.AddDbContext<ChChatarra40Context>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection"
        )
    )
);


// ==========================================
// REGISTRO DE DAO
// ==========================================

builder.Services.AddScoped<UsuarioDAO>();
builder.Services.AddScoped<CategoriaDAO>();
builder.Services.AddScoped<ProductosDAO>();
builder.Services.AddScoped<TiendaDAO>();
builder.Services.AddScoped<VendedorDAO>();
builder.Services.AddScoped<FavoritosDAO>();
builder.Services.AddScoped<CarritoDAO>();
builder.Services.AddScoped<RenseniaProductoDAO>();
builder.Services.AddScoped<VentaDAO>();
builder.Services.AddScoped<PedidoDAO>();


// ==========================================
// REGISTRO DE ENVÍO
// ==========================================

builder.Services.AddScoped<CoberturaTiendaDAO>();
builder.Services.AddScoped<MetodoEntregaTiendaDAO>();


// ==========================================
// REGISTRO DE INVENTARIO
// ==========================================

builder.Services.AddScoped<InventarioDAO>();


// ==========================================
// CONTROL SIG
// ==========================================

builder.Services.AddScoped<SIGVendedorDAO>();
builder.Services.AddScoped<SIGAdministradorDAO>();


// ==========================================
// REGISTRO DE SERVICIOS
// ==========================================

builder.Services.AddScoped<AuthService>();


// ==========================================
// MINERÍA DE DATOS
// ==========================================

builder.Services.AddHttpClient(
    "MineriaAPI",
    client =>
    {
        client.BaseAddress =
            new Uri("http://127.0.0.1:8000");

        client.Timeout =
            TimeSpan.FromSeconds(10);
    }
);

builder.Services.AddScoped<MineriaService>();

builder.Services.AddHostedService<
    MineriaPythonService
>();


// ==========================================
// CONFIGURACIÓN JWT
// ==========================================

var jwtKey =
    builder.Configuration["Jwt:Key"];

var jwtIssuer =
    builder.Configuration["Jwt:Issuer"];

var jwtAudience =
    builder.Configuration["Jwt:Audience"];


if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "La clave JWT no está configurada."
    );
}


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme =
        JwtBearerDefaults.AuthenticationScheme;

    options.DefaultChallengeScheme =
        JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters =
        new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,

            IssuerSigningKey =
                new SymmetricSecurityKey(
                    Encoding.UTF8.GetBytes(jwtKey)
                ),

            ClockSkew = TimeSpan.Zero
        };
});


builder.Services.AddAuthorization();


// ==========================================
// CONTROLADORES Y JSON
// ==========================================

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options
            .JsonSerializerOptions
            .ReferenceHandler =
                System.Text.Json.Serialization
                    .ReferenceHandler
                    .IgnoreCycles;

        options
            .JsonSerializerOptions
            .WriteIndented = true;
    });


// ==========================================
// SWAGGER
// ==========================================

builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
        {
            Name = "Authorization",

            Type =
                Microsoft.OpenApi.Models
                    .SecuritySchemeType
                    .Http,

            Scheme = "bearer",

            BearerFormat = "JWT",

            In =
                Microsoft.OpenApi.Models
                    .ParameterLocation
                    .Header,

            Description =
                "Ingrese el token JWT."
        }
    );


    options.AddSecurityRequirement(
        new Microsoft.OpenApi.Models
            .OpenApiSecurityRequirement
        {
            {
                new Microsoft.OpenApi.Models
                    .OpenApiSecurityScheme
                {
                    Reference =
                        new Microsoft.OpenApi.Models
                            .OpenApiReference
                        {
                            Type =
                                Microsoft.OpenApi.Models
                                    .ReferenceType
                                    .SecurityScheme,

                            Id = "Bearer"
                        }
                },

                Array.Empty<string>()
            }
        }
    );
});


// ==========================================
// CREAR APLICACIÓN
// ==========================================

var app = builder.Build();


// ==========================================
// MIDDLEWARE
// ==========================================

app.UseCors("CorsPolicy");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();