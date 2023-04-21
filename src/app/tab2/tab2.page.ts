import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { DatabaseService } from '../database.service';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
registerLocaleData(localeDe);
interface Transaction {
  date: Date;
  description: string;
  amount: number;
}

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  // set german locale
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }],
})
export class Tab2Page {
  public transactions: Transaction[] = [];
  public endSum: number = 0;

  constructor(private database: DatabaseService) {}

  async ionViewWillEnter() {
    this.transactions = await this.database.getAllTransactions();
    this.endSum = await this.database.getEndSum();
  }

  async addTransaction() {
    const date = new Date();
    const description = 'Einzahlung';
    const amount = 25;
    await this.database.addTransaction(date, description, amount);
    this.transactions = await this.database.getAllTransactions();
    this.endSum = await this.database.getEndSum();
  }
}
