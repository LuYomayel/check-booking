import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import { EmailService } from 'src/email/email.service';
@Injectable()
export class TestService {
  constructor(private readonly emailService: EmailService) {}
  async scraping() {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(
      'https://www.qld.gov.au/transport/licensing/getting/practical-tests',
    );

    try {
      const hrefs = await page.$$eval('ul li a', (elements) => {
        return elements.map((element) => element.href);
      });

      const bookAndPayOnlineLink = hrefs.find((href) =>
        href.includes('WelcomeDrivingTest'),
      );

      //   const bookAndPayOnlineLink = links[0]; // Assuming only one link with the text

      if (bookAndPayOnlineLink) {
        const href = bookAndPayOnlineLink;

        await page.goto(href);

        const continueButton = await page.$(
          '#j_id_60\\:aboutThisServiceForm\\:continueButton',
        );

        await continueButton.click();
        await page.waitForNavigation();

        const acceptButton = await page.$(
          '#termsAndConditions\\:TermsAndConditionsForm\\:acceptButton',
        );
        acceptButton.click();
        await page.waitForNavigation();

        // Fill out the form
        await page.type('#CleanBookingDEForm\\:dlNumber', '145328922');
        await page.type('#CleanBookingDEForm\\:contactName', 'Luciano Yomayel');
        await page.type('#CleanBookingDEForm\\:contactPhone', '0424336250');
        await page.select('#CleanBookingDEForm\\:productType_input', 'PTC'); // Select "Class C/CA - Car (manual/automatic)"
        const confirmForm = await page.$(
          '#CleanBookingDEForm\\:actionFieldList\\:confirmButtonField\\:confirmButton',
        );

        confirmForm.click();
        await page.waitForNavigation();

        const confirmLicenseDetails = await page.$(
          '#BookingConfirmationForm\\:actionFieldList\\:confirmButtonField\\:confirmButton',
        );

        await confirmLicenseDetails.click();
        await page.waitForNavigation();

        //*
        await page.waitForSelector('#BookingSearchForm\\:region_input');
        // Select the first dropdown option
        await page.select(
          '#BookingSearchForm\\:region_input',
          '21387516381000',
        );
        await page.waitForSelector('#BookingSearchForm\\:region_input');
        // Wait for the second dropdown to be updated based on the first selection
        // Wait for the centers to be loaded
        await page.waitForFunction(() => {
          const selectElement = document.querySelector(
            '#BookingSearchForm\\:centre_input',
          ) as HTMLSelectElement;
          return selectElement.options.length > 1;
        });
        await page.select('#BookingSearchForm\\:centre_input', '976000000');

        //*
        const lastConfirmButton = await page.$(
          '#BookingSearchForm\\:actionFieldList\\:confirmButtonField\\:confirmButton',
        );
        await lastConfirmButton.click();
        await page.waitForNavigation();

        const availableBookingLocation = await page.$$eval(
          '#slotSelectionForm\\:slotTable_data tr td:nth-child(3)',
          (elements) => {
            return elements.map((element) => element.textContent);
          },
        );

        if (availableBookingLocation[0] !== 'Maroochydore CSC')
          console.log('Error de lugar: ', availableBookingLocation);

        const availableBookingTimes = await page.$$eval(
          '#slotSelectionForm\\:slotTable_data tr td:nth-child(2)',
          (elements) => {
            return elements.map((element) => element.textContent);
          },
        );
        // availableBookingTimes.push('Thursday, 11 May 2024 12:00 AM');
        // availableBookingTimes.push('Monday, 15 May 2024 12:00 AM');
        const today = new Date();
        const maxDate = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // Today + 7 days

        availableBookingTimes.forEach((dateString) => {
          const date = new Date(dateString);
          if (date.getTime() <= maxDate.getTime()) {
            this.emailService.sendEmail(dateString);
            console.log(`Date ${dateString} is within the allowed range`);
          } else {
            console.log(`Date ${dateString} is outside the allowed range`);
          }
        });
      } else {
        console.error('Link "book and pay online" not found');
      }
    } catch (error) {
      console.error('Error navigating to link:', error);
    }

    await browser.close();
  }
}
