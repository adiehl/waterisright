import { Injectable } from '@angular/core';
import * as localforage from 'localforage';

interface Transaction {
  date: Date;
  description: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor() {
    localforage.config({
      driver: localforage.INDEXEDDB, // Use indexedDB as the storage engine
      name: 'wir' // Change this to your preferred database name
    });
  }

  async createDatabase() {
    try {
      await localforage.setItem<Transaction[]>('transactions', []);
      await this.insertInitialData();
    } catch (error) {
      console.error(error);
    }
  }

  async insertInitialData() {
    const transactions = await localforage.getItem<Transaction[]>('transactions') || [];
    transactions.push({ date: new Date(), description: 'Einzahlung', amount: 50 });
    await localforage.setItem('transactions', transactions);
  }

  async addTransaction(date: Date, description: string, amount: number) {
    const transactions = await localforage.getItem<Transaction[]>('transactions') || [];
    transactions.push({ date, description, amount });
    await localforage.setItem('transactions', transactions);
  }

  async getAllTransactions() {
    const transactions = await localforage.getItem<Transaction[]>('transactions') || [];
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    return transactions;
  }

  async getEndSum() {
    const transactions = await localforage.getItem<Transaction[]>('transactions') || [];
    const endSum = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
    return endSum;
  }
}
