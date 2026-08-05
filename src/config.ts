
export const PAYMENT_CONFIG = {
  telebirr: {
    accountName: "Jemal Fano Haji (IresoJ Digital CSC)",
    accountNumber: "0911234567", // Replace with your actual Telebirr number
    merchantId: "MS_123456", // Optional: Replace with your Merchant ID if applicable
    instructions: {
      en: [
        "Open your Telebirr App",
        "Select 'Pay with Telebirr'",
        "Enter our Merchant ID or Phone Number",
        "Enter the exact amount for your service",
        "Complete the payment and copy the Transaction Reference Number",
        "Submit the reference number in our payment verification form"
      ],
      om: [
        "Appii Telebirr keessan banaa",
        "Filannoo 'Telebirr kaffali' jedhu filadhaa",
        "ID Merchant ykn Lakkoofsa Bilbilaa keenya galchaa",
        "Maallaqa kaffaltii tajaajilaa sirrii ta'e galchaa",
        "Kaffaltii xumuraatii Lakkoofsa ReFirensii (Transaction ID) qabadhaa",
        "Lakkoofsa refirensii sana unka mirkaneessaa kaffaltii keenya irratti galchaa"
      ]
    }
  },
  cbeBirr: {
    accountName: "Jemal Fano Haji (IresoJ Digital CSC)",
    accountNumber: "1000123456789", // Replace with your actual CBE account number
    instructions: {
      en: [
        "Dial *847# or use CBE Birr App",
        "Choose 'Transfer Money' or 'Pay Merchant'",
        "Enter our CBE Birr Account Number",
        "Verify the account name: IresoJ Digital CSC",
        "Enter the amount and your PIN",
        "Keep the SMS confirmation for reference"
      ],
      om: [
        "Bilbila keessaniin *847# irratti bilbilaa ykn Appii CBE Birr fayyadamaa",
        "Filannoo 'Maallaqa Ergi' ykn 'Kaffaltii' filadhaa",
        "Lakkoofsa Herrega CBE Birr keenya galchaa",
        "Maqaa herreggaa mirkaneessaa: IresoJ Digital CSC",
        "Hanga kaffaltii fi lakkoofsa iccitii (PIN) keessan galchaa",
        "SMS mirkaneessaa sana ragaaf qabadhaa"
      ]
    }
  }
};
