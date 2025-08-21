import emailjs from 'emailjs-com';
import { InvoiceData } from '@/types/invoice';
import { generatePDFBlob } from './pdfGenerator';

// EmailJS configuration - you'll need to set up your EmailJS account
const EMAIL_SERVICE_ID = 'your_service_id'; // Replace with your EmailJS service ID
const EMAIL_TEMPLATE_ID = 'your_template_id'; // Replace with your EmailJS template ID
const EMAIL_PUBLIC_KEY = 'your_public_key'; // Replace with your EmailJS public key

export interface EmailConfig {
  serviceId?: string;
  templateId?: string;
  publicKey?: string;
}

export const initEmailJS = (config?: EmailConfig) => {
  const publicKey = config?.publicKey || EMAIL_PUBLIC_KEY;
  if (publicKey && publicKey !== 'your_public_key') {
    emailjs.init(publicKey);
    return true;
  }
  return false;
};

export const sendInvoiceEmail = async (
  invoice: InvoiceData,
  recipients: string[],
  subject: string,
  message: string,
  config?: EmailConfig
): Promise<boolean> => {
  try {
    // Initialize EmailJS if not already done
    if (!initEmailJS(config)) {
      // If EmailJS is not configured, simulate email sending
      console.log('EmailJS not configured. Simulating email send...');
      
      // Generate PDF blob for download
      const pdfBlob = await generatePDFBlob(invoice);
      
      // Create download link for the PDF
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Email simulation completed. PDF downloaded instead.');
      return true;
    }

    // Generate PDF as base64 for email attachment
    const pdfBlob = await generatePDFBlob(invoice);
    const pdfBase64 = await blobToBase64(pdfBlob);

    // Prepare email template parameters
    const templateParams = {
      to_email: recipients.join(', '),
      subject: subject,
      message: message,
      invoice_number: invoice.invoiceNumber,
      invoice_amount: invoice.total.toFixed(2),
      company_name: invoice.companyName,
      client_name: invoice.billToName,
      due_date: new Date(invoice.dueDate).toLocaleDateString(),
      pdf_attachment: pdfBase64,
      pdf_filename: `invoice-${invoice.invoiceNumber}.pdf`
    };

    // Send email using EmailJS
    const serviceId = config?.serviceId || EMAIL_SERVICE_ID;
    const templateId = config?.templateId || EMAIL_TEMPLATE_ID;
    
    const response = await emailjs.send(serviceId, templateId, templateParams);
    
    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Helper function to open email client with pre-filled content
export const openEmailClient = (
  invoice: InvoiceData,
  recipients: string[],
  subject: string,
  message: string
) => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedMessage = encodeURIComponent(
    `${message}\n\n` +
    `Invoice Details:\n` +
    `- Invoice #: ${invoice.invoiceNumber}\n` +
    `- Amount: $${invoice.total.toFixed(2)}\n` +
    `- Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\n` +
    `Please note: PDF attachment needs to be added manually.`
  );
  
  const mailtoLink = `mailto:${recipients.join(',')}?subject=${encodedSubject}&body=${encodedMessage}`;
  window.open(mailtoLink);
};