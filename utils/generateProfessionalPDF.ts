// utils/generateProfessionalPDF.ts
// Install: npm install pdfkit

import PDFDocument from 'pdfkit';
import fs from 'fs';

export function generateProfessionalPDF(bookData: any, outputPath: string) {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: {
      top: 72,
      bottom: 72,
      left: 72,
      right: 72
    }
  });

  // Pipe to file
  doc.pipe(fs.createWriteStream(outputPath));

  // Title page
  doc.fontSize(28)
     .font('Helvetica-Bold')
     .text(bookData.title, { align: 'center' });
  
  doc.moveDown();
  doc.fontSize(18)
     .font('Helvetica')
     .text(bookData.subtitle, { align: 'center' });

  // Chapters
  bookData.chapters.forEach((chapter: any, index: number) => {
    doc.addPage();
    
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(`Chapter ${index + 1}`, { align: 'left' });
    
    doc.fontSize(18)
       .text(chapter.title);
    
    doc.moveDown();
    doc.fontSize(12)
       .font('Helvetica')
       .text(chapter.content, {
         align: 'justify',
         lineGap: 6
       });
  });

  // End the document
  doc.end();
}