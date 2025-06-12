import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import validateSchema from '../middlewares/validation.middleware';
import { categorySchema, updateCategorySchema } from '../schemas/category.schema'
import authMiddleware from '../middlewares/auth.middleware';
import authorizeRole from '../middlewares/role.middleware';

const router = express.Router();

router.post('', authMiddleware, authorizeRole(["ADMIN"]), validateSchema(categorySchema), createCategory);
router.get('', getCategories);
router.get('/:id', getCategoryById);
router.patch('/:id', authMiddleware, authorizeRole(["ADMIN"]), validateSchema(updateCategorySchema), updateCategory);
router.delete('/:id', authMiddleware, authorizeRole(["ADMIN"]), deleteCategory);

export default router;