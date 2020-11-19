import { Request, Response } from 'express';

import CreateCustomerService from '@modules/customers/services/CreateCustomerService';

import { container } from 'tsyringe';

export default class CustomersController {
  public async create(request: Request, response: Response): Promise<Response> {
    // TODO
    const { name, email } = request.body;
    const createCustomers = container.resolve(CreateCustomerService);

    const newCustomer = await createCustomers.execute({ name, email });

    return response.json(newCustomer).status(201).send();
  }
}
