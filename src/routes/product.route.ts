import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';
import { productSchema, updateProductSchema } from '../schemas/product.schema';
import validateSchema from '../middlewares/validation.middleware';

const router = express.Router();

router.post('', validateSchema(productSchema), createProduct);
router.get('', getProducts);
router.get('/:id', getProductById);
router.patch('/:id', validateSchema(updateProductSchema), updateProduct);
router.delete('/:id', deleteProduct);

export default router;