import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);
    let category_id = '';

    if (!['income', 'outcome'].includes(type)) {
      throw Error('Transaction type invalid.');
    }
    const transactionsRepo = new TransactionsRepository();
    const { total } = await transactionsRepo.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError(
        'You can not create outcome bigger then your balance.',
      );
    }

    const categoryExist = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (categoryExist) {
      category_id = categoryExist.id;
    } else {
      const newCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(newCategory);
      category_id = newCategory.id;
    }

    const transactionDTO = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transactionDTO);

    const newTransaction = await transactionRepository.findOne(
      {
        id: transactionDTO.id,
      },
      { relations: ['category'] },
    );

    if (!newTransaction) {
      throw new AppError('A problem occurs on create new transaction');
    }

    return newTransaction;
  }
}

export default CreateTransactionService;
