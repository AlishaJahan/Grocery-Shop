import { AppDataSource } from '../config/database';
import { ProductService } from './services/productService';

const test = async () => {
    await AppDataSource.initialize();
    const service = new ProductService();
    
    // get first product
    const products = await service.getAllProducts();
    if (products.length === 0) {
        console.log("No products");
        process.exit(0);
    }
    
    const p = products[0];
    console.log("Before:", p);
    
    // update
    const updated = await service.updateProduct(p.id, p.name + " Test", p.price + 1, p.stock);
    console.log("After update returned:", updated);
    
    const productsAfter = await service.getAllProducts();
    console.log("Total products count:", productsAfter.length);
    
    process.exit(0);
};

test();
