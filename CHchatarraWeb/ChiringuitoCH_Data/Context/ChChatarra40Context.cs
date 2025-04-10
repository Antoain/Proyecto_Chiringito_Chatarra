using System;
using System.Collections.Generic;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;

namespace ChiringuitoCH_Data.Context;

public partial class ChChatarra40Context : DbContext
{
    public ChChatarra40Context()
    {
    }

    public ChChatarra40Context(DbContextOptions<ChChatarra40Context> options)
        : base(options)
    {
    }

    public virtual DbSet<Administradore> Administradores { get; set; }

    public virtual DbSet<Carrito> Carritos { get; set; }

    public virtual DbSet<Categorium> Categoria { get; set; }

    public virtual DbSet<Departamento> Departamentos { get; set; }

    public virtual DbSet<DetalleVentum> DetalleVenta { get; set; }

    public virtual DbSet<Distrito> Distritos { get; set; }

    public virtual DbSet<Evento> Eventos { get; set; }

    public virtual DbSet<Favorito> Favoritos { get; set; }

    public virtual DbSet<Producto> Productos { get; set; }

    public virtual DbSet<Promocione> Promociones { get; set; }

    public virtual DbSet<Provincium> Provincia { get; set; }

    public virtual DbSet<ResenasProducto> ResenasProductos { get; set; }

    public virtual DbSet<ResenasTienda> ResenasTiendas { get; set; }

    public virtual DbSet<Servicio> Servicios { get; set; }

    public virtual DbSet<Tienda> Tiendas { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<Vendedore> Vendedores { get; set; }

    public virtual DbSet<Ventum> Venta { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Data Source=localhost;Initial Catalog=Ch_Chatarra4_0;User ID=antonio;Password=contra1234;Encrypt=False");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Administradore>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__Administ__4E3E04AD7037D69E");

            entity.Property(e => e.IdUsuario)
                .ValueGeneratedNever()
                .HasColumnName("id_usuario");
            entity.Property(e => e.FechaInicio).HasColumnName("fecha_inicio");
            entity.Property(e => e.NivelAcceso)
                .HasDefaultValue(1)
                .HasColumnName("nivel_acceso");

            entity.HasOne(d => d.IdUsuarioNavigation).WithOne(p => p.Administradore)
                .HasForeignKey<Administradore>(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Administradores_Usuarios");
        });

        modelBuilder.Entity<Carrito>(entity =>
        {
            entity.HasKey(e => e.IdCarrito).HasName("PK__CARRITO__8B4A618CE7A58596");

            entity.ToTable("CARRITO");

            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.Carritos)
                .HasForeignKey(d => d.IdProducto)
                .HasConstraintName("FK_Carrito_Producto");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.Carritos)
                .HasForeignKey(d => d.IdUsuario)
                .HasConstraintName("FK_Carrito_Usuario");
        });

        modelBuilder.Entity<Categorium>(entity =>
        {
            entity.HasKey(e => e.IdCategoria).HasName("PK__CATEGORI__A3C02A107A4430E1");

            entity.ToTable("CATEGORIA");

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Descripcion)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.FechaRegistro).HasDefaultValueSql("(getdate())");
        });

        modelBuilder.Entity<Departamento>(entity =>
        {
            entity.HasKey(e => e.IdDepartamento).HasName("PK__Departam__787A433D7987D6AE");

            entity.ToTable("Departamento");

            entity.Property(e => e.Descripcion)
                .HasMaxLength(255)
                .IsUnicode(false);
        });

        modelBuilder.Entity<DetalleVentum>(entity =>
        {
            entity.HasKey(e => e.IdDetalleVenta).HasName("PK__DETALLE___AAA5CEC283FF3C42");

            entity.ToTable("DETALLE_VENTA");

            entity.Property(e => e.Total).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.DetalleVenta)
                .HasForeignKey(d => d.IdProducto)
                .HasConstraintName("FK_DetalleVenta_Producto");

            entity.HasOne(d => d.IdVentaNavigation).WithMany(p => p.DetalleVenta)
                .HasForeignKey(d => d.IdVenta)
                .HasConstraintName("FK_DetalleVenta_Venta");
        });

        modelBuilder.Entity<Distrito>(entity =>
        {
            entity.HasKey(e => e.IdDistrito).HasName("PK__Distrito__DE8EED59AC0CE4BA");

            entity.ToTable("Distrito");

            entity.Property(e => e.Descripcion)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.IdProvinciaNavigation).WithMany(p => p.Distritos)
                .HasForeignKey(d => d.IdProvincia)
                .HasConstraintName("FK_Distrito_Provincia");
        });

        modelBuilder.Entity<Evento>(entity =>
        {
            entity.HasKey(e => e.IdEvento).HasName("PK__Eventos__AF150CA5B6F900FA");

            entity.Property(e => e.IdEvento).HasColumnName("id_evento");
            entity.Property(e => e.Descripcion)
                .HasColumnType("text")
                .HasColumnName("descripcion");
            entity.Property(e => e.Direccion)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("direccion");
            entity.Property(e => e.FotoLugarUrl)
                .HasMaxLength(512)
                .IsUnicode(false)
                .HasColumnName("foto_lugar_url");
            entity.Property(e => e.HoraFin)
                .HasColumnType("datetime")
                .HasColumnName("hora_fin");
            entity.Property(e => e.HoraInicio)
                .HasColumnType("datetime")
                .HasColumnName("hora_inicio");
            entity.Property(e => e.PrecioEntrada)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("precio_entrada");
            entity.Property(e => e.TipoEvento)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("tipo_evento");
            entity.Property(e => e.Ubicacion)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("ubicacion");
            entity.Property(e => e.VideoUrl)
                .HasMaxLength(512)
                .IsUnicode(false)
                .HasColumnName("video_url");
        });

        modelBuilder.Entity<Favorito>(entity =>
        {
            entity.HasKey(e => e.IdFavorito).HasName("PK__Favorito__78F875AE04E9604F");

            entity.Property(e => e.IdFavorito).HasColumnName("id_favorito");
            entity.Property(e => e.IdProducto).HasColumnName("id_producto");
            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.Favoritos)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Favoritos_Producto");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.Favoritos)
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Favoritos_Usuario");
        });

        modelBuilder.Entity<Producto>(entity =>
        {
            entity.HasKey(e => e.IdProducto).HasName("PK__PRODUCTO__098892106241C02D");

            entity.ToTable("PRODUCTO");

            entity.HasIndex(e => e.Sku, "UQ__PRODUCTO__DDDF4BE7A4CCDD77").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.Descripcion)
                .HasMaxLength(500)
                .IsUnicode(false);
            entity.Property(e => e.FechaRegistro).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IdTienda).HasColumnName("Id_tienda");
            entity.Property(e => e.Nombre)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Precio).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.RutaImagen)
                .HasMaxLength(1024)
                .IsUnicode(false);
            entity.Property(e => e.Sku)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("sku");

            entity.HasOne(d => d.IdCategoriaNavigation).WithMany(p => p.Productos)
                .HasForeignKey(d => d.IdCategoria)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Producto_Categoria");

            entity.HasOne(d => d.IdTiendaNavigation).WithMany(p => p.Productos)
                .HasForeignKey(d => d.IdTienda)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Producto_Tienda");
        });

        modelBuilder.Entity<Promocione>(entity =>
        {
            entity.HasKey(e => e.IdPromocion).HasName("PK__Promocio__F89308E03576D2F6");

            entity.Property(e => e.IdPromocion).HasColumnName("id_promocion");
            entity.Property(e => e.Descripcion)
                .HasColumnType("text")
                .HasColumnName("descripcion");
            entity.Property(e => e.Descuento)
                .HasColumnType("decimal(10, 2)")
                .HasColumnName("descuento");
            entity.Property(e => e.FechaFin).HasColumnName("fecha_fin");
            entity.Property(e => e.FechaInicio).HasColumnName("fecha_inicio");
            entity.Property(e => e.IdEvento)
                .HasDefaultValueSql("(NULL)")
                .HasColumnName("id_evento");
            entity.Property(e => e.IdProducto)
                .HasDefaultValueSql("(NULL)")
                .HasColumnName("id_producto");
            entity.Property(e => e.IdTienda)
                .HasDefaultValueSql("(NULL)")
                .HasColumnName("id_tienda");
            entity.Property(e => e.Titulo)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("titulo");

            entity.HasOne(d => d.IdEventoNavigation).WithMany(p => p.Promociones)
                .HasForeignKey(d => d.IdEvento)
                .HasConstraintName("FK_Promocion_Evento");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.Promociones)
                .HasForeignKey(d => d.IdProducto)
                .HasConstraintName("FK_Promocion_Producto");

            entity.HasOne(d => d.IdTiendaNavigation).WithMany(p => p.Promociones)
                .HasForeignKey(d => d.IdTienda)
                .HasConstraintName("FK_Promocion_Tienda");
        });

        modelBuilder.Entity<Provincium>(entity =>
        {
            entity.HasKey(e => e.IdProvincia).HasName("PK__Provinci__EED74455340FED8C");

            entity.Property(e => e.Descripcion)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.HasOne(d => d.IdDepartamentoNavigation).WithMany(p => p.Provincia)
                .HasForeignKey(d => d.IdDepartamento)
                .HasConstraintName("FK_Provincia_Departamento");
        });

        modelBuilder.Entity<ResenasProducto>(entity =>
        {
            entity.HasKey(e => e.IdResena).HasName("PK__ResenasP__06CD93633C1C7BC0");

            entity.Property(e => e.IdResena).HasColumnName("id_resena");
            entity.Property(e => e.Calificacion).HasColumnName("calificacion");
            entity.Property(e => e.Comentario)
                .HasColumnType("text")
                .HasColumnName("comentario");
            entity.Property(e => e.IdProducto).HasColumnName("id_producto");
            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");

            entity.HasOne(d => d.IdProductoNavigation).WithMany(p => p.ResenasProductos)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ResenaProd_Producto");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.ResenasProductos)
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ResenaProd_Usuario");
        });

        modelBuilder.Entity<ResenasTienda>(entity =>
        {
            entity.HasKey(e => e.IdResena).HasName("PK__ResenasT__06CD9363E3773081");

            entity.Property(e => e.IdResena).HasColumnName("id_resena");
            entity.Property(e => e.Calificacion).HasColumnName("calificacion");
            entity.Property(e => e.Comentario)
                .HasColumnType("text")
                .HasColumnName("comentario");
            entity.Property(e => e.IdTienda).HasColumnName("id_tienda");
            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");

            entity.HasOne(d => d.IdTiendaNavigation).WithMany(p => p.ResenasTienda)
                .HasForeignKey(d => d.IdTienda)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ResenaTienda_Tienda");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.ResenasTienda)
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ResenaTienda_Usuario");
        });

        modelBuilder.Entity<Servicio>(entity =>
        {
            entity.HasKey(e => e.IdServicio).HasName("PK__Servicio__6FD07FDC3EB88845");

            entity.Property(e => e.IdServicio).HasColumnName("id_servicio");
            entity.Property(e => e.AreaServicio)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("area_servicio");
            entity.Property(e => e.CategoriaServicio)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("categoria_servicio");
            entity.Property(e => e.Descripcion)
                .HasColumnType("text")
                .HasColumnName("descripcion");
            entity.Property(e => e.EmpresaServicio)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("empresa_servicio");
            entity.Property(e => e.IdTienda).HasColumnName("id_tienda");
            entity.Property(e => e.Materiales)
                .HasColumnType("text")
                .HasColumnName("materiales");
            entity.Property(e => e.NombreServicio)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("nombre_servicio");
            entity.Property(e => e.TiempoEstimado)
                .HasMaxLength(50)
                .IsUnicode(false)
                .HasColumnName("tiempo_estimado");

            entity.HasOne(d => d.IdTiendaNavigation).WithMany(p => p.Servicios)
                .HasForeignKey(d => d.IdTienda)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Servicios_Tiendas");
        });

        modelBuilder.Entity<Tienda>(entity =>
        {
            entity.HasKey(e => e.IdTienda).HasName("PK__Tiendas__7C49D7366CF538EF");

            entity.Property(e => e.IdTienda).HasColumnName("id_tienda");
            entity.Property(e => e.CuentaEnvio)
                .HasDefaultValue(false)
                .HasColumnName("cuenta_envio");
            entity.Property(e => e.Eslogan)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("eslogan");
            entity.Property(e => e.FacebookUrl)
                .HasMaxLength(1024)
                .IsUnicode(false)
                .HasColumnName("facebook_url");
            entity.Property(e => e.FechaRegistro).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.FotoFachadaUrl)
                .HasMaxLength(1024)
                .IsUnicode(false)
                .HasColumnName("foto_fachada_url");
            entity.Property(e => e.Horario)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("horario");
            entity.Property(e => e.IdCategoria).HasColumnName("id_categoria");
            entity.Property(e => e.IdVendedor).HasColumnName("id_vendedor");
            entity.Property(e => e.NombreNegocio)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("nombre_negocio");
            entity.Property(e => e.NumeroContacto)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("numero_contacto");
            entity.Property(e => e.PaginaWebUrl)
                .HasMaxLength(1024)
                .IsUnicode(false)
                .HasColumnName("pagina_web_url");
            entity.Property(e => e.RegistroNegocio)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("registro_negocio");

            entity.HasOne(d => d.IdCategoriaNavigation).WithMany(p => p.Tienda)
                .HasForeignKey(d => d.IdCategoria)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tiendas_Categoria");

            entity.HasOne(d => d.IdVendedorNavigation).WithMany(p => p.Tienda)
                .HasForeignKey(d => d.IdVendedor)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tiendas_Vendedores");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__Usuarios__4E3E04AD447CB874");

            entity.HasIndex(e => e.Correo, "UQ__Usuarios__60695A196D36E835").IsUnique();

            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");
            entity.Property(e => e.Apellidos)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Clave)
                .HasMaxLength(512)
                .IsUnicode(false);
            entity.Property(e => e.Correo)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.FechaRegistro).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.Nombres)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Rol)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("rol");
        });

        modelBuilder.Entity<Vendedore>(entity =>
        {
            entity.HasKey(e => e.IdUsuario).HasName("PK__Vendedor__4E3E04ADE8ADE311");

            entity.Property(e => e.IdUsuario)
                .ValueGeneratedNever()
                .HasColumnName("id_usuario");
            entity.Property(e => e.FechaInicio).HasColumnName("fecha_inicio");
            entity.Property(e => e.Rfc)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasColumnName("rfc");

            entity.HasOne(d => d.IdUsuarioNavigation).WithOne(p => p.Vendedore)
                .HasForeignKey<Vendedore>(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Vendedores_Usuarios");
        });

        modelBuilder.Entity<Ventum>(entity =>
        {
            entity.HasKey(e => e.IdVenta).HasName("PK__VENTA__BC1240BD62EA937F");

            entity.ToTable("VENTA");

            entity.Property(e => e.Direccion)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Estado)
                .HasMaxLength(20)
                .IsUnicode(false)
                .HasDefaultValue("pendiente");
            entity.Property(e => e.FechaVenta).HasDefaultValueSql("(getdate())");
            entity.Property(e => e.IdTienda).HasColumnName("id_tienda");
            entity.Property(e => e.IdUsuario).HasColumnName("id_usuario");
            entity.Property(e => e.MontoTotal).HasColumnType("decimal(10, 2)");
            entity.Property(e => e.Telefono)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.HasOne(d => d.IdDistritoNavigation).WithMany(p => p.Venta)
                .HasForeignKey(d => d.IdDistrito)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Venta_Distrito");

            entity.HasOne(d => d.IdTiendaNavigation).WithMany(p => p.Venta)
                .HasForeignKey(d => d.IdTienda)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Venta_Tienda");

            entity.HasOne(d => d.IdUsuarioNavigation).WithMany(p => p.Venta)
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Venta_Usuario");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
