import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import archiver from 'archiver'; // For zipping images
import { runPythonScript } from '../services/pythonService.js';

// Helper to delete temp files
const cleanup = async (files) => {
    const fileList = Array.isArray(files) ? files : [files];
    await Promise.all(fileList.map(f => fs.unlink(f).catch(() => {})));
};

export const mergePDFs = async (req, res) => {
    try {
        if (!req.files || req.files.length < 2) return res.status(400).json({ error: 'Upload at least 2 files' });
        
        const filePaths = req.files.map(f => path.resolve(f.path));
        const outputPath = path.resolve(`uploads/merged_${Date.now()}.pdf`);

        const result = await runPythonScript('merge', { files: filePaths, output: outputPath });

        res.download(result.filePath, 'merged.pdf', () => cleanup([...filePaths, result.filePath]));
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const splitPDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        
        // Parse pages
        let pages = req.body.pages;
        
        // Handle string input from FormData
        if (typeof pages === 'string') {
            // Check if it's a JSON array string like "[1, 2]"
            if (pages.trim().startsWith('[')) {
                pages = JSON.parse(pages);
            } 
            // Check if it's comma-separated like "1,2,3"
            else if (pages.includes(',')) {
                pages = pages.split(',');
            } 
            // Fallback for single number like "1"
            else {
                // Try parsing as JSON (handles "1" -> 1)
                try {
                    const parsed = JSON.parse(pages);
                    pages = [parsed]; // Wrap in array
                } catch {
                    pages = [pages]; // Keep as string in array
                }
            }
        } 
        // Handle if it came in as a raw number
        else if (typeof pages === 'number') {
            pages = [pages];
        }

        // Final Safety Check: Ensure it is an array
        if (!Array.isArray(pages)) {
            pages = [pages];
        }

        const inputPath = path.resolve(req.file.path);
        const outputFolder = path.resolve('uploads');

        const result = await runPythonScript('split', { 
            file: inputPath, 
            pages: pages, 
            output_folder: outputFolder 
        });

        res.download(result.filePath, 'split.pdf', () => cleanup([inputPath, result.filePath]));
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const rotatePDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const inputPath = path.resolve(req.file.path);
        const outputPath = path.resolve(`uploads/rotated_${Date.now()}.pdf`);
        const angle = parseInt(req.body.rotation) || 90;
        const pageNum = parseInt(req.body.page) || 1; // Default to page 1 if not specified

        // Construct rotation dict { page_number: angle }
        // You can enhance this to accept a map for multiple pages
        const rotations = { [pageNum]: angle };

        const result = await runPythonScript('rotate', { 
            file: inputPath, 
            output: outputPath, 
            rotations 
        });

        res.download(result.filePath, 'rotated.pdf', () => cleanup([inputPath, result.filePath]));
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const protectPDF = async (req, res) => {
    try {
        if (!req.file || !req.body.password) return res.status(400).json({ error: 'File and password required' });

        const inputPath = path.resolve(req.file.path);
        const outputPath = path.resolve(`uploads/protected_${Date.now()}.pdf`);

        const result = await runPythonScript('protect', {
            file: inputPath,
            output: outputPath,
            password: req.body.password
        });

        res.download(result.filePath, 'protected.pdf', () => cleanup([inputPath, result.filePath]));
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const compressPDF = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const inputPath = path.resolve(req.file.path);
        const outputPath = path.resolve(`uploads/compressed_${Date.now()}.pdf`);

        const result = await runPythonScript('compress', {
            file: inputPath,
            output: outputPath,
            level: req.body.level || 'medium'
        });

        res.download(result.filePath, 'compressed.pdf', () => cleanup([inputPath, result.filePath]));
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const extractText = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const inputPath = path.resolve(req.file.path);

        const result = await runPythonScript('extract_text', { file: inputPath });

        res.json({ success: true, text: result.text });
        await cleanup(inputPath);
    } catch (e) { res.status(500).json({ error: e.message }); }
};





export const extractImages = async (req, res) => {
    // defined outside try/catch to be accessible in cleanup
    let inputPath, outputFolder, zipPath;

    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        inputPath = path.resolve(req.file.path);
        outputFolder = path.resolve(`uploads/images_${Date.now()}`);
        zipPath = `${outputFolder}.zip`;

        console.log(`[Extract Images] Processing: ${inputPath}`);

        // 1. Run Python to extract images
        // If this fails, it throws an error and jumps to catch block (sending JSON)
        const result = await runPythonScript('extract_images', { 
            file: inputPath, 
            output_folder: outputFolder 
        });

        console.log(`[Extract Images] Python success. Images in: ${result.folder}`);

        // 2. Create the ZIP file
        const output = createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        // 3. Set up event listeners BEFORE processing
        output.on('close', () => {
             console.log(`[Extract Images] Zipping complete (${archive.pointer()} bytes). Sending file...`);
             
             // Send the ZIP file to the client
             res.download(zipPath, 'extracted_images.zip', async (err) => {
                if (err) {
                    console.error("[Extract Images] Download/Send Error:", err);
                    // Cannot send JSON error here because headers are already sent
                }
                
                // Cleanup everything
                await cleanup([inputPath, zipPath]);
                if (outputFolder) {
                    await fs.rm(outputFolder, { recursive: true, force: true }).catch(() => {});
                }
             });
        });

        // Handle archiving errors explicitly
        archive.on('error', (err) => {
            throw err; // Forward to catch block
        });

        // 4. Start Archiving
        archive.pipe(output);
        
        // Append files from the output folder into the zip
        archive.directory(result.folder, false);
        
        // Finalize the archive (this triggers the 'close' event above)
        await archive.finalize();

    } catch (e) { 
        console.error("[Extract Images] Controller Error:", e);
        
        // Cleanup on error
        if (inputPath) await cleanup(inputPath);
        if (outputFolder) await fs.rm(outputFolder, { recursive: true, force: true }).catch(() => {});
        if (zipPath) await cleanup(zipPath);

        // This is why you see raw JSON: We send the error details back to the client.
        if (!res.headersSent) {
            res.status(500).json({ error: e.message || 'Image extraction failed' });
        }
    }
};
export const signPDF = async (req, res) => {
    let pdfPath, sigPath, outputPath; // Define variables for cleanup scope

    try {
        if (!req.files || !req.files.file || !req.files.signature) {
            return res.status(400).json({ error: 'PDF and Signature image required' });
        }

        // 1. Store paths in variables so we can clean them up later
        pdfPath = path.resolve(req.files.file[0].path);
        sigPath = path.resolve(req.files.signature[0].path);
        outputPath = path.resolve(`uploads/signed_${Date.now()}.pdf`);

        const x = parseFloat(req.body.x) || 100;
        const y = parseFloat(req.body.y) || 100;
        const width = parseFloat(req.body.width) || 100;
        const height = parseFloat(req.body.height) || 50;
        const page = parseInt(req.body.page) || 1;
        const allPages = req.body.all_pages === 'true';

        const result = await runPythonScript('sign', {
            file: pdfPath,
            output: outputPath,
            signature_img: sigPath,
            page: page,
            position: [x, y, width, height],
            all_pages: allPages
        });

        // 2. ✅ FIX: Pass the actual variables to cleanup
        res.download(result.filePath, 'signed.pdf', (err) => {
            if (err) console.error("Download error:", err);
            cleanup([pdfPath, sigPath, result.filePath]); 
        });

    } catch (e) { 
        // Attempt cleanup even on error
        if (pdfPath && sigPath) cleanup([pdfPath, sigPath]);
        res.status(500).json({ error: e.message }); 
    }
};