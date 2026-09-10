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

    public virtual DbSet<Pedido> Pedidos { get; set; }

    public virtual DbSet<SubPedido> SubPedidos { get; set; }

    public virtual DbSet<DetalleSubPedido> DetalleSubPedidos { get; set; }

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

    public virtual DbSet<CoberturaTienda> CoberturasTienda { get; set; }

    public virtual DbSet<EntregaSubPedido> EntregasSubPedido { get; set; }

    public virtual DbSet<Ventum> Venta { get; set; }
    public virtual DbSet<Inventario> Inventarios { get; set; }
    public virtual DbSet<MovimientoInventario> MovimientosInventario { get; set; }

    public virtual DbSet<MetodoEntregaTienda> MetodosEntregaTienda { get; set; }
    public virtual DbSet<HistorialEntrega> HistorialEntregas { get; set; }

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

        modelBuilder.Entity<Pedido>(entity =>
        {
            entity.HasKey(e => e.IdPedido);

            entity.ToTable("PEDIDO");

            entity.Property(e => e.IdPedido)
                .HasColumnName("IdPedido");

            entity.Property(e => e.IdUsuario)
                .HasColumnName("id_usuario");

            entity.Property(e => e.IdDistrito)
                .HasColumnName("IdDistrito");

            entity.Property(e => e.Subtotal)
                .HasColumnType("decimal(12, 2)");

            entity.Property(e => e.CostoEnvio)
                .HasColumnType("decimal(12, 2)")
                .HasDefaultValue(0m);

            entity.Property(e => e.Total)
                .HasColumnType("decimal(12, 2)");

            entity.Property(e => e.DireccionEntrega)
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.Property(e => e.Telefono)
                .HasMaxLength(20)
                .IsUnicode(false);

            entity.Property(e => e.MetodoPago)
                .HasMaxLength(30)
                .IsUnicode(false);

            entity.Property(e => e.Estado)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("PENDIENTE");

            entity.Property(e => e.FechaPedido)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(d => d.IdUsuarioNavigation)
                .WithMany(p => p.Pedidos)
                .HasForeignKey(d => d.IdUsuario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pedido_Usuario");

            entity.HasOne(d => d.IdDistritoNavigation)
                .WithMany(p => p.Pedidos)
                .HasForeignKey(d => d.IdDistrito)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Pedido_Distrito");
        });

        modelBuilder.Entity<SubPedido>(entity =>
        {
            entity.HasKey(e => e.IdSubPedido);

            entity.ToTable("SUB_PEDIDO");

            entity.Property(e => e.IdSubPedido)
                .HasColumnName("IdSubPedido");

            entity.Property(e => e.IdPedido)
                .HasColumnName("IdPedido");

            entity.Property(e => e.IdTienda)
                .HasColumnName("id_tienda");

            entity.Property(e => e.Subtotal)
                .HasColumnType("decimal(12, 2)");

            entity.Property(e => e.CostoEnvio)
                .HasColumnType("decimal(12, 2)")
                .HasDefaultValue(0m);

            entity.Property(e => e.ComisionPlataforma)
                .HasColumnType("decimal(12, 2)")
                .HasDefaultValue(0m);

            entity.Property(e => e.TotalVendedor)
                .HasColumnType("decimal(12, 2)");

            entity.Property(e => e.Estado)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("PENDIENTE");

            entity.Property(e => e.FechaActualizacion)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("(sysdatetime())");

            entity.Property(e => e.MetodoEntrega)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("MetodoEntrega");

            entity.HasOne(e => e.IdPedidoNavigation)
                .WithMany(p => p.SubPedidos)
                .HasForeignKey(e => e.IdPedido)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SubPedido_Pedido");

            entity.HasOne(e => e.IdTiendaNavigation)
                .WithMany(t => t.SubPedidos)
                .HasForeignKey(e => e.IdTienda)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SubPedido_Tienda");
        });

        modelBuilder.Entity<DetalleSubPedido>(entity =>
        {
            entity.HasKey(e => e.IdDetalleSubPedido);

            entity.ToTable("DETALLE_SUBPEDIDO");

            entity.Property(e => e.IdDetalleSubPedido)
                .HasColumnName("IdDetalleSubPedido");

            entity.Property(e => e.IdSubPedido)
                .HasColumnName("IdSubPedido");

            entity.Property(e => e.IdProducto)
                .HasColumnName("IdProducto");

            entity.Property(e => e.Cantidad);

            entity.Property(e => e.PrecioUnitario)
                .HasColumnType("decimal(12, 2)");

            entity.Property(e => e.Descuento)
                .HasColumnType("decimal(12, 2)")
                .HasDefaultValue(0m);

            entity.Property(e => e.Subtotal)
                .HasColumnType("decimal(12, 2)");

            entity.HasOne(d => d.IdSubPedidoNavigation)
                .WithMany(p => p.Detalles)
                .HasForeignKey(d => d.IdSubPedido)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DetalleSubPedido_SubPedido");

            entity.HasOne(d => d.IdProductoNavigation)
                .WithMany(p => p.DetalleSubPedidos)
                .HasForeignKey(d => d.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_DetalleSubPedido_Producto");
        });

        modelBuilder.Entity<Inventario>(entity =>
        {
            entity.HasKey(e => e.IdInventario);

            entity.ToTable("INVENTARIO");

            entity.HasIndex(e => e.IdProducto)
                .IsUnique();

            entity.Property(e => e.IdInventario)
                .HasColumnName("IdInventario");

            entity.Property(e => e.IdProducto)
                .HasColumnName("IdProducto");

            entity.Property(e => e.StockActual)
                .HasColumnName("StockActual")
                .HasDefaultValue(0);

            entity.Property(e => e.StockMinimo)
                .HasColumnName("StockMinimo")
                .HasDefaultValue(5);

            entity.Property(e => e.StockMaximo)
                .HasColumnName("StockMaximo");

            entity.Property(e => e.FechaActualizacion)
                .HasColumnName("FechaActualizacion")
                .HasColumnType("datetime2")
                .HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(e => e.IdProductoNavigation)
                .WithOne(p => p.Inventario)
                .HasForeignKey<Inventario>(e => e.IdProducto)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Inventario_Producto");
        });

        modelBuilder.Entity<MovimientoInventario>(entity =>
        {
            entity.HasKey(e => e.IdMovimiento);

            entity.ToTable("MOVIMIENTO_INVENTARIO");

            entity.Property(e => e.IdMovimiento)
                .HasColumnName("IdMovimiento");

            entity.Property(e => e.IdInventario)
                .HasColumnName("IdInventario");

            entity.Property(e => e.TipoMovimiento)
                .HasColumnName("TipoMovimiento")
                .HasMaxLength(30)
                .IsUnicode(false);

            entity.Property(e => e.Cantidad)
                .HasColumnName("Cantidad");

            entity.Property(e => e.StockAnterior)
                .HasColumnName("StockAnterior");

            entity.Property(e => e.StockNuevo)
                .HasColumnName("StockNuevo");

            entity.Property(e => e.Motivo)
                .HasColumnName("Motivo")
                .HasMaxLength(255)
                .IsUnicode(false);

            entity.Property(e => e.Referencia)
                .HasColumnName("Referencia")
                .HasMaxLength(100)
                .IsUnicode(false);

            entity.Property(e => e.FechaMovimiento)
                .HasColumnName("FechaMovimiento")
                .HasColumnType("datetime2")
                .HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(e => e.IdInventarioNavigation)
                .WithMany(i => i.MovimientosInventario)
                .HasForeignKey(e => e.IdInventario)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Movimiento_Inventario");
        });

        modelBuilder.Entity<CoberturaTienda>(entity =>
        {
            entity.HasKey(e => e.IdCobertura);

            entity.ToTable("COBERTURA_TIENDA");

            entity.HasIndex(
                e => new { e.IdTienda, e.IdDistrito }
            ).IsUnique();

            entity.Property(e => e.IdCobertura)
                .HasColumnName("IdCobertura");

            entity.Property(e => e.IdTienda)
                .HasColumnName("IdTienda");

            entity.Property(e => e.IdDistrito)
                .HasColumnName("IdDistrito");

            entity.Property(e => e.CostoEnvio)
                .HasColumnName("CostoEnvio")
                .HasColumnType("decimal(10,2)")
                .HasDefaultValue(0m);

            entity.Property(e => e.Activo)
                .HasColumnName("Activo")
                .HasDefaultValue(true);

            entity.Property(e => e.FechaRegistro)
                .HasColumnName("FechaRegistro")
                .HasColumnType("datetime2")
                .HasDefaultValueSql("(sysdatetime())");

            entity.HasOne(e => e.IdTiendaNavigation)
                .WithMany()
                .HasForeignKey(e => e.IdTienda)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cobertura_Tienda");

            entity.HasOne(e => e.IdDistritoNavigation)
                .WithMany()
                .HasForeignKey(e => e.IdDistrito)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Cobertura_Distrito");
        });

        modelBuilder.Entity<MetodoEntregaTienda>(entity =>
        {
            entity.HasKey(e => e.IdMetodoEntrega);

            entity.ToTable("METODO_ENTREGA_TIENDA");

            entity.HasIndex(
                e => new
                {
                    e.IdTienda,
                    e.TipoMetodo
                })
                .IsUnique();

            entity.Property(e => e.IdMetodoEntrega)
                .HasColumnName("IdMetodoEntrega");

            entity.Property(e => e.IdTienda)
                .HasColumnName("IdTienda");

            entity.Property(e => e.TipoMetodo)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("TipoMetodo");

            entity.Property(e => e.Activo)
                .HasDefaultValue(true)
                .HasColumnName("Activo");

            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("FechaRegistro");

            entity.HasOne(d => d.IdTiendaNavigation)
                .WithMany()
                .HasForeignKey(d => d.IdTienda)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName(
                    "FK_MetodoEntrega_Tienda");
        });

        modelBuilder.Entity<EntregaSubPedido>(entity =>
        {
            entity.HasKey(e => e.IdEntrega);

            entity.ToTable("ENTREGA_SUBPEDIDO");

            entity.HasIndex(e => e.IdSubPedido)
                .IsUnique();

            entity.Property(e => e.IdEntrega)
                .HasColumnName("IdEntrega");

            entity.Property(e => e.IdSubPedido)
                .HasColumnName("IdSubPedido");

            entity.Property(e => e.MetodoEntrega)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("MetodoEntrega");

            entity.Property(e => e.EstadoEntrega)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasDefaultValue("PENDIENTE")
                .HasColumnName("EstadoEntrega");

            entity.Property(e => e.ProveedorEntrega)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("ProveedorEntrega");

            entity.Property(e => e.CodigoSeguimiento)
                .HasMaxLength(100)
                .IsUnicode(false)
                .HasColumnName("CodigoSeguimiento");

            entity.Property(e => e.FechaCreacion)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("FechaCreacion");

            entity.Property(e => e.FechaActualizacion)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("FechaActualizacion");

            entity.Property(e => e.FechaEntrega)
                .HasColumnName("FechaEntrega");

            entity.HasOne(d => d.IdSubPedidoNavigation)
                .WithOne(sp => sp.EntregaSubPedido)
                .HasForeignKey<EntregaSubPedido>(d => d.IdSubPedido)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Entrega_SubPedido");
        });

        modelBuilder.Entity<HistorialEntrega>(entity =>
        {
            entity.HasKey(e => e.IdHistorial);

            entity.ToTable("HISTORIAL_ENTREGA");

            entity.Property(e => e.IdHistorial)
                .HasColumnName("IdHistorial");

            entity.Property(e => e.IdEntrega)
                .HasColumnName("IdEntrega");

            entity.Property(e => e.EstadoAnterior)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("EstadoAnterior");

            entity.Property(e => e.EstadoNuevo)
                .HasMaxLength(30)
                .IsUnicode(false)
                .HasColumnName("EstadoNuevo");

            entity.Property(e => e.FechaCambio)
                .HasDefaultValueSql("(sysdatetime())")
                .HasColumnName("FechaCambio");

            entity.Property(e => e.Observacion)
                .HasMaxLength(255)
                .IsUnicode(false)
                .HasColumnName("Observacion");

            entity.HasOne(d => d.IdEntregaNavigation)
                .WithMany(p => p.HistorialEntregas)
                .HasForeignKey(d => d.IdEntrega)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Historial_Entrega");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
