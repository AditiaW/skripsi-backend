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
import authMiddleware from '../middlewares/auth.middleware';
import authorizeRole from '../middlewares/role.middleware';

const router = express.Router();

router.post('', authMiddleware, authorizeRole(["ADMIN"]), validateSchema(productSchema), createProduct);
router.get('', getProducts);
router.get('/:id', getProductById);
router.patch('/:id', authMiddleware, authorizeRole(["ADMIN"]), validateSchema(updateProductSchema), updateProduct);
router.delete('/:id', authMiddleware, authorizeRole(["ADMIN"]), deleteProduct);

export default router;