import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authMiddleware, adminMiddleware } from '../middleware/authMiddleware';
import { upload } from '../middleware/upload';

const router = Router();
const productController = new ProductController();

router.post('/', authMiddleware, adminMiddleware, upload.single('image'), productController.createProduct);
router.get('/suggestions', productController.getSuggestions);
router.get('/', productController.getProducts);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

export default router;
