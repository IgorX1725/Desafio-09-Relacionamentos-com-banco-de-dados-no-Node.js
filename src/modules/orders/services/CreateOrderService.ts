import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    // TODO

    const customer = await this.customersRepository.findById(customer_id);

    if (!customer) {
      throw new AppError('customer not found');
    }

    const products_id = products.map(product => {
      return { id: product.id };
    });
    const productsFound = await this.productsRepository.findAllById(
      products_id,
    );

    const finalListProducts = products.map(product => {
      const productMatch = productsFound.find(
        productFound => productFound.id === product.id,
      );
      if (!productMatch) {
        throw new AppError(`Product with id ${product.id} was not found`);
      }
      if (productMatch.quantity < product.quantity) {
        throw new AppError(
          `insuficient quantity in stock from product: ${productMatch.name} `,
        );
      }

      productMatch.quantity -= product.quantity;

      return {
        product_id: product.id,
        price: productMatch.price,
        quantity: product.quantity,
      };
    });

    await this.productsRepository.updateQuantity(productsFound);
    const order = await this.ordersRepository.create({
      customer,
      products: finalListProducts,
    });

    return order;
  }
}

export default CreateOrderService;
