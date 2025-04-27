import DataStorage from "../db/DataStorage.js";
import logger from "../logger.js";
const dataStorage = new DataStorage({ dbName: "DMSRL" });

async function getProductsByLimit(req, res) {
  const query = req.query;
  if (!query?.limit) {
    // <-- SI NO EXISTE LIMITE
    res.status(400).json({
      error: true,
      data: null,
      message: "Necesitas especificar el limite de la query.",
    });
    return;
  }
  if (isNaN(Number(query?.limit))) {
    // <-- SI EL LIMITE NO ES UN NUMERO
    res.status(400).json({
      error: true,
      data: null,
      message: "El límite debe ser un número.",
    });
    return;
  }
  try {
    const parsedLimit = parseInt(query.limit);
    const data = await dataStorage.getAll(parsedLimit);

    res.json({
      error: false,
      data,
      message: `Productos totales: ${data.length}; Productos solicitados: ${parsedLimit}`,
    });
  } catch (e) {
    if (e instanceof Error) {
      const { message } = e;
      res.status(500).json({
        error: true,
        data: null,
        message,
      });
    }
  }
}
async function getProductById(req, res) {
  const params = req.params;

  if (!params?.id) {
    res.status(400).json({
      error: true,
      data: null,
      message: "Necesitas especificar el limite de la query.",
    });

    return;
  }

  try {
    const data = await dataStorage.get(params.id);

    res.json({
      error: false,
      data,
      message: `Producto obtenido!`,
    });
  } catch (e) {
    if (e instanceof Error) {
      logger.error(e.message);
      const { message } = e;
      res.status(500).json({
        error: true,
        data: null,
        message,
      });
    }
  }
}
async function setProduct(req, res) {
  const payload = req.body;

  try {
    const savedProduct = await dataStorage.save(payload);

    res.json({
      error: false,
      data: savedProduct,
      message: `Producto guardado!`,
    });
  } catch (e) {
    if (e instanceof Error) {
      const { message } = e;
      res.status(500).json({
        error: true,
        data: null,
        message,
      });
    }
  }
}
async function updateProduct(req, res) {
  const payload = req.body;
  const params = req.params;

  if (!params?.id) {
    res.status(400).json({
      error: true,
      data: null,
      message: "Necesitas especificar el limite de la query.",
    });

    return;
  }

  try {
    const updatedProduct = await dataStorage.update(params.id, payload);
    res.json({
      error: false,
      data: updatedProduct,
      message: `Producto actualizado!`,
    });
  } catch (e) {
    if (e instanceof Error) {
      const { message } = e;
      res.status(500).json({
        error: true,
        data: null,
        message,
      });
    }
  }
}
async function deleteProduct(req, res) {
  const params = req.params;

  if (!params || !params?.id) {
    res.status(400).json({
      error: true,
      data: null,
      message: "Necesitas especificar el id del producto que quieres borrar.",
    });
    return;
  }

  const { id } = params;
  try {
    await dataStorage.delete(id);

    res.json({
      error: false,
      data: null,
      message: "¡Archivo borrado!",
    });
  } catch (e) {
    if (e instanceof Error) {
      const { message } = e;
      res.status(500).json({
        error: true,
        data: null,
        message,
      });
    }
  }
}

export {
  getProductById,
  getProductsByLimit,
  setProduct,
  updateProduct,
  deleteProduct,
};
