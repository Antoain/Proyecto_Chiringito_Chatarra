# CHchatarra4_0
**Documentacion de FrontEnd**
- Se debe descargar todo el contenido de la carpeta "pages"
- Una vez descargado se abre la carpeta en visual studio code
- Puedes darle a correr y te redireccionara a las paginas( debe usarse una extension de visual para correrlo como un host)

La estructura es la siguinente:

![image](https://github.com/user-attachments/assets/58d2abd0-e32b-4f08-ab08-0777708c0147)

En cada carpeta se encuentra su JSX y CSS respectivo, los cuales puedes editar


**Documentacion para Backend**  
Consideraciones:  
Para este proyecto se necesita descargar algunas dependencias para su buen funcionamiento
- Para la biblioteca de Datos se requiere instalar los siguientes paquetes: Microsoft.EntityFrameworkCore, Microsoft.EntityFrameworkCore.Design, Microsoft.EntityFrameworkCore.SqlServer y Microsoft.EntityFrameworkCore.Tools
- Para que pueda funcionar correctamente la pagina web, debe tener en cuenta que en visual studio debe poder configurar que si inicien 2 proyectos a la vez:
  Paso 1: Dirijase a la solucion y de click derecho.
  Paso 2: Selccione Prppiedades.
  Paso 3: Marque la opcion de proyectos multiples
  Paso 4:  seleccione Iniciar en: CapaPresentacion y WebAPICh
Esto permitira que si lo que desea es ver el funcionamiento de la pagina, esto pueda ser posible, ya que se esta utilizando CORS para manejar fetch, esto se debe a que la pagina y la Api poseen un puerto diferente.

Si usted desea probar individualmete la Api y la Pagina no realice los pasos anteriores, importante mencionar que si se abre unicamente la pagina puddan aparecer advertencias de google, esto porque no se esta recibiendo las solicitudes de http de la Api. En caso que no realice los pasos anteriores.


Para visualizar información sobre las vistas, backend, sobre su uso y funcionamieto de los endpoints puede acceder al siguiente enlace: https://www.notion.so/Documentaci-n-1ed27d98582d801297aaf3e89e005f4c?pvs=4
