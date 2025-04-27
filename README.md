# Sistema de Almacenamiento Basado en Archivos con Node.js

Este proyecto implementa un sistema simple de almacenamiento de datos basado en archivos JSON usando Node.js. Está diseñado para manejar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) de manera segura y eficiente, con soporte para concurrencia, caché en memoria y un sistema de respaldo automático.

## Características

- **Operaciones CRUD**: Permite guardar, actualizar, obtener y eliminar registros.
- **Manejo de Concurrencia**: Usa una cola de operaciones para procesar lecturas y escrituras de manera ordenada y segura.
- **Caché en Memoria**: Optimiza las lecturas manteniendo una copia de los datos en memoria.
- **Transacciones Atómicas**: Usa archivos temporales y operaciones de renombrado para garantizar escrituras seguras.
- **Sistema de Respaldo**: Crea respaldos automáticos después de cada escritura y permite restaurar desde un respaldo específico.
- **Testing Completo**: Incluye pruebas unitarias e integrales usando Jest para asegurar la funcionalidad.

## Estructura del Proyecto

file-storage-system/
├── src/
│ ├── FileManager.js # Maneja operaciones de lectura/escritura de archivos
│ ├── DataStorage.js # Implementa la lógica de almacenamiento de datos
│ ├── index.js # Archivo de prueba principal
├── tests/
│ ├── FileManager.test.js # Pruebas para FileManager
│ ├── DataStorage.test.js # Pruebas para DataStorage
├── data/
│ ├── <dbName>.json # Archivo de datos principal
│ ├── temp\_<dbName>.json # Archivo temporal para escrituras atómicas
│ ├── backups/
│ │ ├── <dbName>/
│ │ │ ├── <timestamp>.json # Respaldos automáticos
├── package.json
├── jest.config.js
└── README.md

## Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd file-storage-system
```

2. Instala las dependencias

```bash
npm install
```

## Uso

**Configuración**
El sistema usa un archivo JSON para almacenar los datos en data/<dbName>.json.

Los respaldos se guardan en data/backups/<dbName>/<timestamp>.json.

Puedes configurar el nombre de la base de datos y las opciones de respaldo al instanciar DataStorage.

```javascript
import DataStorage from "./src/DataStorage.js";

(async () => {
  const storage = new DataStorage({
    dbName: "productos",
    backupConfig: { maxBackups: 5 },
  });

  // Guardar un nuevo registro
  const nuevoProducto = await storage.save({ nombre: "Laptop", precio: 1500 });

  // Obtener un registro por ID
  const producto = await storage.get(nuevoProducto._id);

  // Actualizar un registro
  await storage.update(producto._id, { precio: 1400 });

  // Eliminar un registro
  await storage.delete(producto._id);

  // Listar todos los registros
  const todosLosProductos = await storage.getAll();

  // Listar respaldos disponibles
  const respaldos = await storage.listBackups();

  // Restaurar desde un respaldo específico
  if (respaldos.length > 0) {
    await storage.restoreBackup(respaldos[0]);
  }
})();
```

## Operaciones Principales

_save(data):_ Crea un nuevo registro con un \_id único y timestamps.

_update(id, data)_: Actualiza un registro existente por su \_id.

_get(id)_: Obtiene un registro por su \_id.

_getAll(limit = 50)_: Obtiene todos los registros, con un límite opcional.

_delete(id)_: Elimina un registro por su \_id.

_listBackups()_: Lista los timestamps de los respaldos disponibles.

_restoreBackup(timestamp)_: Restaura los datos desde un respaldo específico.

## Testing

El proyecto incluye un conjunto completo de pruebas usando Jest. Para ejecutar las pruebas:

Las pruebas cubren:

- Operaciones CRUD en DataStorage.

- Operaciones de archivo en FileManager.

- Sistema de respaldo y restauración.

- Manejo de concurrencia y caché.

# Detalles Técnicos

## Manejo de Concurrencia

- Usa p-queue para encolar operaciones de lectura y escritura, asegurando que se procesen en orden y sin conflictos.

## Caché en Memoria

- Mantiene una copia de los datos en memoria para acelerar las lecturas.
- Se sincroniza automáticamente con las operaciones de escritura.

## Transacciones Atómicas

- Usa archivos temporales y la operación rename para garantizar que las escrituras sean atómicas y seguras.

## Sistema de Respaldo

- Crea respaldos automáticos después de cada escritura.
- Limita el número de respaldos a un máximo configurable (por defecto, 5).
- Permite restaurar desde cualquier respaldo disponible.

# Mejoras Futuras

1. Respaldos Periódicos: Implementar respaldos basados en tiempo (por ejemplo, cada hora).

2. Compresión de Respaldos: Comprimir los archivos de respaldo para ahorrar espacio.

3. Validación de Integridad: Agregar checksums para verificar la integridad de los respaldos.

4. Soporte para Múltiples Colecciones: Permitir múltiples archivos JSON para diferentes tipos de datos.

5. Integración con Bases de Datos: Migrar a una base de datos real para alta concurrencia o grandes volúmenes de datos.

# Licencia

**Este proyecto está licenciado bajo la Licencia MIT.**
