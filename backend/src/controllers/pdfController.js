// --- IMPORTS ---
import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';

// Manual Permission Object (Fixes "Permission not found" in Node.js ESM)
const Permission = {
  Print: 4,
  Modify: 8,
  Copy: 16,
  Annotate: 32,
  FillForms: 256,
  Extract: 512,
  Assemble: 1024,
  PrintHighResolution: 2048,
};

// --- MERGE PDFs ---
export const mergePDFs = async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: 'Please upload at least 2 PDF files.' });
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of req.files) {
      const fileBuffer = await fs.readFile(file.path);
      const pdf = await PDFDocument.load(fileBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      await fs.unlink(file.path); 
    }

    const pdfBytes = await mergedPdf.save();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=merged.pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Merge Error:', error);
    res.status(500).json({ error: 'Failed to merge PDFs' });
  }
};

// --- SPLIT PDF ---
export const splitPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file.' });
    }

    const { pages } = req.body; 
    if (!pages) {
      return res.status(400).json({ error: 'Page numbers are required.' });
    }

    let pageNumbers;
    try {
      pageNumbers = JSON.parse(pages); 
      if (!Array.isArray(pageNumbers)) throw new Error();
    } catch (e) {
      return res.status(400).json({ error: 'Invalid page format.' });
    }

    const fileBuffer = await fs.readFile(req.file.path);
    const srcPdf = await PDFDocument.load(fileBuffer);
    const newPdf = await PDFDocument.create();
    const totalPages = srcPdf.getPageCount();

    const validPageIndices = pageNumbers
      .map(num => parseInt(num) - 1)
      .filter(index => index >= 0 && index < totalPages);

    if (validPageIndices.length === 0) {
        return res.status(400).json({ error: 'No valid pages found to split.' });
    }

    const copiedPages = await newPdf.copyPages(srcPdf, validPageIndices);
    copiedPages.forEach((page) => newPdf.addPage(page));

    const pdfBytes = await newPdf.save();
    await fs.unlink(req.file.path); 

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=split.pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Split Error:', error);
    if (req.file) await fs.unlink(req.file.path).catch(() => {}); 
    res.status(500).json({ error: 'Failed to split PDF' });
  }
};

// --- ROTATE PDF ---
export const rotatePDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file.' });
    }

    const rotation = parseInt(req.body.rotation) || 90; 

    const fileBuffer = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(fileBuffer);
    const pages = pdfDoc.getPages();

    pages.forEach((page) => {
      const currentRotation = page.getRotation().angle;
      page.setRotation({ type: 'degrees', angle: currentRotation + rotation });
    });

    const pdfBytes = await pdfDoc.save();
    await fs.unlink(req.file.path);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=rotated.pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Rotate Error:', error);
    res.status(500).json({ error: 'Failed to rotate PDF' });
  }
};

// --- PROTECT PDF ---
export const protectPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a PDF file.' });
    }

    const { password } = req.body;
    if (!password) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Password is required.' });
    }

    const fileBuffer = await fs.readFile(req.file.path);
    const pdfDoc = await PDFDocument.load(fileBuffer);

    // DEBUG: Verify library version capabilities
    if (!pdfDoc.encrypt) {
      throw new Error("Your installed version of pdf-lib is too old! Run 'npm install pdf-lib@latest'");
    }

    pdfDoc.encrypt({
      userPassword: password,
      ownerPassword: password,
      permissions: [
        Permission.Print, // 4
        Permission.Copy,  // 16
      ],
    });

    const pdfBytes = await pdfDoc.save();
    await fs.unlink(req.file.path);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=protected.pdf');
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('Protect Error:', error);
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    res.status(500).json({ error: error.message || 'Failed to protect PDF' });
  }
};