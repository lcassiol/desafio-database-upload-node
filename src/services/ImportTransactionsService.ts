import csv from 'csv-parser';
import fs from 'fs';
import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filePath: string;
}

interface TransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filePath }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    const transactions: Transaction[] = [];
    const csvContent: TransactionDTO[] = [];

    const parseCSV = fs.createReadStream(filePath).pipe(
      csv({
        mapHeaders: ({ header, index }) => header.trim(),
        mapValues: ({ header, index, value }) => value.trim(),
      }),
    );

    parseCSV.on('data', async data => {
      const { title, value, type, category } = data;
      csvContent.push({ title, value, type, category });
    });

    await new Promise(resolve => parseCSV.on('data', resolve));

    const promises = csvContent.map(async transactionRow => {
      const { title, value, type, category } = transactionRow;
      const transaction = await createTransaction.execute({
        title,
        value,
        type,
        category,
        ignoreValue: true,
      });

      transactions.push(transaction);
    });

    await Promise.all(promises);

    return transactions;
  }
}

export default ImportTransactionsService;
