import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product';

export class ProductService {
    private productRepository = AppDataSource.getRepository(Product);

    async createProduct(name: string, price: number, stock: number, category?: string, imageUrl?: string, description?: string, brand?: string, unit?: string): Promise<Product> {
        const product = this.productRepository.create({ name, price, stock, category, imageUrl, description, brand, unit });
        return await this.productRepository.save(product);
    }

    async updateProduct(id: number, name: string, price: number, stock: number, category?: string, imageUrl?: string, description?: string, brand?: string, unit?: string): Promise<Product | null> {
        const product = await this.getProductById(id);
        if (!product) return null;
        product.name = name;
        product.price = price;
        product.stock = stock;
        if (category) product.category = category;
        if (imageUrl) product.imageUrl = imageUrl;
        if (description !== undefined) product.description = description;
        if (brand !== undefined) product.brand = brand;
        if (unit !== undefined) product.unit = unit;
        return await this.productRepository.save(product);
    }

    async getAllProducts(category?: string): Promise<Product[]> {
        const query: any = {};
        if (category && category !== 'All') {
            query.where = { category };
        }
        return await this.productRepository.find(query);
    }

    async getProductById(id: number): Promise<Product | null> {
        return await this.productRepository.findOneBy({ id });
    }

    async getSuggestions(query: string): Promise<Product[]> {
        return await this.productRepository
            .createQueryBuilder('product')
            .where('LOWER(product.name) LIKE LOWER(:query)', { query: `%${query}%` })
            .take(5) // Limit to top 5 suggestions
            .getMany();
    }

    async deleteProduct(id: number): Promise<void> {
        await this.productRepository.delete(id);
    }
}
