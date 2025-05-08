# CHchatarra4_0
// Documentacion de FrontEnd
Para la visualizacion del codigo de las vistas se debe utilizar este linl: https://drive.google.com/drive/folders/1748rejatKW6ObKcXTZtm3JYcJ33e7fEU?usp=sharing
- Se debe descargar todo el contenido de la carpta
- Una vez descargado se abre la carpeta en visual studio code
- Puedes darle a correr y te redireccionara a las paginas( debe usarse una extension de visual para correrlo como un host)

La estructura es la siguinente:
![image](https://github.com/user-attachments/assets/bf3ae2f5-20c3-4541-aada-9a75948df1bc)
En cada carpeta se encuentra su HTML y CSS respectivo, los cuales puedes editar

Se puede acceder al Documento:
https://docs.google.com/document/d/19FjNrLASl4tFo6Nc35SaAy20tbswwVxNKo6-S8qOvZI/edit?usp=sharing
En el se econtrara mas informacion sobre el uso y detalles de las vistas




//Documentacion para Backend
Para la visualizacion de el backen y sobre su uso y detalles puedes acceder a este documento: https://docs.google.com/document/d/19FjNrLASl4tFo6Nc35SaAy20tbswwVxNKo6-S8qOvZI/edit?usp=sharing
En el encontraras pruebas del funcionamiento de los endpoints.

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
