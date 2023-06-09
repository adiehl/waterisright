import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CommonModule } from '@angular/common';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
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
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
  providers: [SocialSharing]
})
export class Tab1Page {
  public picture: string | null = null;
  public transactions: Transaction[] = [];
  public endSum: number = 0;

  constructor(
    private socialSharing: SocialSharing,
    private database: DatabaseService,
    ) {}

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    this.picture = 'data:image/jpeg;base64,' + image.base64String;
    await this.watermark();
  }

  async watermark() {
    const image = new Image();
    image.src = this.picture || '';
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = image.width;

      canvas.height = image.height;
      if (context) {
        console.log('Context');
        // Draw the original image on the canvas
        context.drawImage(image, 0, 0, image.width, image.height);

        // Load the watermark image and draw it on the canvas
        const watermark = new Image();
        watermark.src = 'assets/watermark.png';
        watermark.onload = () => {
        const maxWidth = canvas.width * 0.3;
        const maxHeight = canvas.height * 0.3;
        const scale = Math.min(maxWidth / watermark.width, maxHeight / watermark.height);
        const x = canvas.width - watermark.width * scale - canvas.width * 0.05;
        const y = canvas.height - watermark.height * scale - canvas.height * 0.05;
        context.drawImage(watermark, x, y, watermark.width * scale, watermark.height * scale);

        this.picture = canvas.toDataURL('image/jpeg');
          
        };
      } else {
      }
    };
  }

  async share() {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const image = new Image();

    image.onload = async () => {
      canvas.width = image.width;
      canvas.height = image.height;
      if (context) {
        // Draw the original image on the canvas
        context.drawImage(image, 0, 0, image.width, image.height);

          // Share the image with the watermark on Instagram
          this.socialSharing.shareViaInstagram(
            'I shared 10 cent', // Caption
            canvas.toDataURL('image/png'), // Image with watermark
          );
          await this.addTransaction();
      }
    };
    if (this.picture) {
      image.src = this.picture;
    }
    
  }

  clear() {
    this.picture = null;
  }


  async ionViewWillEnter() {
    this.transactions = await this.database.getAllTransactions();
    this.endSum = await this.database.getEndSum();
  }

  async addTransaction() {
    const date = new Date();
    const description = 'Instafoto 20 cent';
    const amount = -0.2;
    await this.database.addTransaction(date, description, amount);
    this.transactions = await this.database.getAllTransactions();
    this.endSum = await this.database.getEndSum();
  }
}
