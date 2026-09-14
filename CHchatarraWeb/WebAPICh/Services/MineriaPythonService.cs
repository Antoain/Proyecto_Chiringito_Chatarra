using System.Diagnostics;

namespace WebAPICh.Services
{
    public class MineriaPythonService : IHostedService
    {
        private Process? _procesoPython;


        public async Task StartAsync(
            CancellationToken cancellationToken)
        {
            var rutaMineria = Path.GetFullPath(
                Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "..",
                    "..",
                    "MineriaDatos"
                )
            );


            Console.WriteLine(
                $"Ruta MineriaDatos: {rutaMineria}"
            );


            if (!Directory.Exists(rutaMineria))
            {
                throw new DirectoryNotFoundException(
                    $"No se encontró la carpeta MineriaDatos en: {rutaMineria}"
                );
            }


            // ==========================================
            // EJECUTABLE DE PYTHON
            // ==========================================

            var pythonExecutable =
                Environment.GetEnvironmentVariable(
                    "MINERIA_PYTHON"
                );


            if (string.IsNullOrWhiteSpace(
                pythonExecutable
            ))
            {
                pythonExecutable = "python";

                Console.WriteLine(
                    "MINERIA_PYTHON no está configurado. " +
                    "Se utilizará Python del sistema."
                );
            }
            else
            {
                Console.WriteLine(
                    "Se utilizará el ejecutable de Python " +
                    "configurado en MINERIA_PYTHON."
                );
            }


            // ==========================================
            // INICIAR FASTAPI / UVICORN
            // ==========================================

            var inicio = new ProcessStartInfo
            {
                FileName = pythonExecutable,

                Arguments =
                    "-m uvicorn api_mineria:app " +
                    "--host 127.0.0.1 --port 8000",

                WorkingDirectory = rutaMineria,

                UseShellExecute = false,

                CreateNoWindow = true,

                RedirectStandardOutput = true,

                RedirectStandardError = true
            };


            _procesoPython = new Process
            {
                StartInfo = inicio,

                EnableRaisingEvents = true
            };


            _procesoPython.OutputDataReceived +=
                (sender, e) =>
                {
                    if (!string.IsNullOrWhiteSpace(
                        e.Data
                    ))
                    {
                        Console.WriteLine(
                            $"[PYTHON] {e.Data}"
                        );
                    }
                };


            _procesoPython.ErrorDataReceived +=
                (sender, e) =>
                {
                    if (!string.IsNullOrWhiteSpace(
                        e.Data
                    ))
                    {
                        Console.WriteLine(
                            $"[PYTHON] {e.Data}"
                        );
                    }
                };


            _procesoPython.Exited +=
                (sender, e) =>
                {
                    Console.WriteLine(
                        "[PYTHON] El proceso de minería terminó."
                    );
                };


            _procesoPython.Start();

            _procesoPython.BeginOutputReadLine();
            _procesoPython.BeginErrorReadLine();


            Console.WriteLine(
                "Iniciando servicio de minería Python..."
            );


            // ==========================================
            // ESPERAR A QUE FASTAPI ESTÉ DISPONIBLE
            // ==========================================

            using var httpClient =
                new HttpClient();


            var servicioListo = false;


            for (
                int intento = 1;
                intento <= 15;
                intento++
            )
            {
                if (_procesoPython.HasExited)
                {
                    throw new Exception(
                        "El proceso Python terminó antes " +
                        "de iniciar FastAPI. Revise la consola."
                    );
                }


                try
                {
                    var respuesta =
                        await httpClient.GetAsync(
                            "http://127.0.0.1:8000/health",
                            cancellationToken
                        );


                    if (respuesta.IsSuccessStatusCode)
                    {
                        servicioListo = true;


                        Console.WriteLine(
                            "Servicio de minería Python listo."
                        );


                        break;
                    }
                }
                catch
                {
                    // FastAPI todavía está arrancando.
                }


                await Task.Delay(
                    1000,
                    cancellationToken
                );
            }


            if (!servicioListo)
            {
                throw new Exception(
                    "FastAPI no respondió en el puerto 8000."
                );
            }
        }


        public Task StopAsync(
            CancellationToken cancellationToken)
        {
            if (
                _procesoPython != null &&
                !_procesoPython.HasExited
            )
            {
                _procesoPython.Kill(
                    entireProcessTree: true
                );


                Console.WriteLine(
                    "Servicio de minería Python detenido."
                );
            }


            _procesoPython?.Dispose();


            return Task.CompletedTask;
        }
    }
}