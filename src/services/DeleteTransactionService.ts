import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const checkTransactionExist = await transactionRepository.findOne({
      id,
    });

    if (!checkTransactionExist) {
      throw new AppError('Transaction does not exists');
    }

    await transactionRepository.delete({ id });
  }
}

export default DeleteTransactionService;
