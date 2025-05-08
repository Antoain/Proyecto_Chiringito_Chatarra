import React, { useState, useEffect } from 'react';
import { 
    obtenerCategorias, 
    crearCategoria, 
    actualizarCategoria, 
    eliminarCategoria 
} from '../../services/data';
import './AdminPagesCss/AdministrarUsuarios.css';

export default function AdministrarCategorias() {
    const [categorias, setCategorias] = useState([]);
    const [categoriaActual, setCategoriaActual] = useState({ idCategoria: '', descripcion: '', activo: true });
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const data = await obtenerCategorias();
                setCategorias(data);
            } catch (error) {
                setError('Hubo un problema al cargar las categorías.');
            }
        };
        fetchCategorias();
    }, []);

    // Función para abrir el modal en modo "crear"
    const manejarAbrirModalCrear = () => {
        setCategoriaActual({ idCategoria: '', descripcion: '', activo: true });
        setShowModal(true);
    };

    // Función para crear una nueva categoría (se invoca desde el modal)
    const manejarCrearNuevaCategoria = async () => {
        if (!categoriaActual.descripcion) {
            setError('La descripción es obligatoria.');
            return;
        }
    
        const nuevaCategoria = {
            descripcion: categoriaActual.descripcion,
            activo: categoriaActual.activo,
        };
    
        try {
            const respuesta = await crearCategoria(nuevaCategoria);
            setCategorias([...categorias, respuesta]);
            setMensaje('Categoría creada exitosamente.');
            setTimeout(() => setMensaje(''), 3000);
            manejarCerrarModal();
        } catch (error) {
            setError('Hubo un problema al crear la categoría.');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Función para actualizar (editar) una categoría existente
    const manejarGuardarCambios = async () => {
        if (!categoriaActual.descripcion) {
            setError('La descripción es obligatoria.');
            return;
        }
    
        const categoriaActualizada = {
            idCategoria: categoriaActual.idCategoria,
            descripcion: categoriaActual.descripcion,
            activo: categoriaActual.activo,
        };
    
        try {
            // Se llama pasando el id y el objeto actualizado
            const respuesta = await actualizarCategoria(categoriaActualizada.idCategoria, categoriaActualizada);
            setCategorias((prevCategorias) =>
                prevCategorias.map((cat) =>
                    cat.idCategoria === categoriaActual.idCategoria ? { ...cat, ...categoriaActualizada } : cat
                )
            );
            setMensaje('Categoría actualizada exitosamente.');
            setTimeout(() => setMensaje(''), 3000);
            manejarCerrarModal();
        } catch (error) {
            setError('Hubo un problema al actualizar la categoría.');
            setTimeout(() => setError(''), 3000);
        }
    };

    // Abre el modal para editar una categoría
    const manejarEditarCategoria = (categoria) => {
        setCategoriaActual({
            idCategoria: categoria.idCategoria,
            descripcion: categoria.descripcion,
            activo: categoria.activo,
        });
        setShowModal(true);
    };
    // Se elimina una categoria
    const manejarEliminarCategoria = async (id) => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;
        try {
            await eliminarCategoria(id);
            setCategorias(categorias.filter((cat) => cat.idCategoria !== id));
            setMensaje('Categoría eliminada exitosamente.');
            setTimeout(() => setMensaje(''), 3000);
        } catch (error) {
            setError('Hubo un problema al eliminar la categoría.');
            setTimeout(() => setError(''), 3000);
        }
    };
    // manejamos una funcion para cerrar el modal
    const manejarCerrarModal = () => {
        setCategoriaActual({ idCategoria: '', descripcion: '', activo: true });
        setShowModal(false);
    };

    return (
        <div className="administrar-background">
            <div className="administrar-container">
                <h1>Administración de Categorías</h1>
                {mensaje && <p className="mensaje-exito">{mensaje}</p>}
                {error && <p className="mensaje-error">{error}</p>}

                {/* Al hacer clic se abre el modal para crear */}
                <button onClick={() => manejarAbrirModalCrear()} className="btn-crear">
                    Crear Categoría
                </button>

                <table className="administrar-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categorias.map((categoria) => (
                            <tr key={categoria.idCategoria}>
                                <td>{categoria.idCategoria}</td>
                                <td>{categoria.descripcion}</td>
                                <td>{categoria.activo ? 'Activo' : 'Inactivo'}</td>
                                <td>
                                    <button onClick={() => manejarEliminarCategoria(categoria.idCategoria)} className="btn-eliminar">
                                        Eliminar
                                    </button>
                                    <button onClick={() => manejarEditarCategoria(categoria)} className="btn-editar">
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>{categoriaActual.idCategoria ? 'Editar Categoría' : 'Crear Categoría'}</h2>

                            <label>Nombre:</label>
                            <input type="text" value={categoriaActual.descripcion || ''} onChange={(e) => setCategoriaActual({ ...categoriaActual, descripcion: e.target.value })}/>

                            <label>Estado:</label>
                            <select
                                value={categoriaActual.activo ? 'true' : 'false'} onChange={(e) => setCategoriaActual({ ...categoriaActual, activo: e.target.value === 'true' })}>
                                <option value="true">Activo</option>
                                <option value="false">Inactivo</option>
                            </select>

                            <div className="modal-actions">
                                <button onClick={() => categoriaActual.idCategoria ? manejarGuardarCambios() : manejarCrearNuevaCategoria()}>
                                    {categoriaActual.idCategoria ? 'Guardar Cambios' : 'Crear Categoría'}
                                </button>
                                <button onClick={() => manejarCerrarModal()}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
