import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/productService';

const productService = new ProductService();

export class ProductController {
    async createProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, price, stock, category, description, brand, unit } = req.body;
            const priceNum = Number(price);
            const stockNum = Number(stock);
            
            if (!name || isNaN(priceNum) || isNaN(stockNum)) {
                return res.status(400).json({ success: false, message: 'Invalid product data' });
            }

            const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
            const product = await productService.createProduct(name, priceNum, stockNum, category, imageUrl, description, brand, unit);
            res.status(201).json({ success: true, data: product });
        } catch (error) {
            next(error);
        }
    }

    async getProducts(req: Request, res: Response, next: NextFunction) {
        try {
            const { category } = req.query;
            const products = await productService.getAllProducts(category as string);
            res.status(200).json({ success: true, data: products });
        } catch (error) {
            next(error);
        }
    }

    async updateProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const { name, price, stock, category, description, brand, unit } = req.body;
            const priceNum = Number(price);
            const stockNum = Number(stock);

            if (!name || isNaN(priceNum) || isNaN(stockNum)) {
                return res.status(400).json({ success: false, message: 'Invalid product data' });
            }

            const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
            const product = await productService.updateProduct(id, name, priceNum, stockNum, category, imageUrl, description, brand, unit);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            res.status(200).json({ success: true, data: product });
        } catch (error) {
            next(error);
        }
    }

    async deleteProduct(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            await productService.deleteProduct(id);
            res.status(200).json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            next(error);
        }
    }

    async getSuggestions(req: Request, res: Response, next: NextFunction) {
        try {
            const query = req.query.q as string;
            if (!query || query.length < 2) {
                return res.status(200).json({ success: true, data: [] });
            }
            const suggestions = await productService.getSuggestions(query);
            res.status(200).json({ success: true, data: suggestions });
        } catch (error) {
            next(error);
        }
    }
}
