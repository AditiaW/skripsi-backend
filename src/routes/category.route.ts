import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import validateSchema from '../middlewares/validation.middleware';
import {categorySchema, updateCategorySchema} from '../schemas/category.schema'

const router = express.Router();

router.post('', validateSchema(categorySchema), createCategory);
router.get('', getCategories);
router.get('/:id', getCategoryById);
router.patch('/:id', validateSchema(updateCategorySchema), updateCategory);
router.delete('/:id', deleteCategory);

export default router;