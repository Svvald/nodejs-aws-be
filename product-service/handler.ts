import { createProduct } from './src/lambda/create-product/create-product';
import { getProductById } from './src/lambda/get-product-by-id/get-product-by-id';
import { getProductsList } from './src/lambda/get-products-list/get-products-list';

export {
  getProductsList,
  getProductById,
  createProduct
};
