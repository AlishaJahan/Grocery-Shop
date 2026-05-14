import { AppDataSource } from './config/database';
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
    
    console.log("Products count before:", products.length);
    console.log("Products:", products.map(p => ({id: p.id, name: p.name, price: p.price})));
    
    // update the first product
    const p = products[0];
    const updated = await service.updateProduct(p.id, p.name + " Test", p.price + 1, p.stock);
    console.log("Updated product returned:", updated);
    
    const productsAfter = await service.getAllProducts();
    console.log("Products count after:", productsAfter.length);
    console.log("Products after:", productsAfter.map(p => ({id: p.id, name: p.name, price: p.price})));
    
    process.exit(0);
};

test();
