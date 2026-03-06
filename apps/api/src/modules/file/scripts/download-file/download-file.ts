#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface Config {
  fileId: string;
}

async function downloadFile() {
  try {
    // Read config
    const configPath = path.join(__dirname, './config.json');
    const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // Read bearer token
    const tokenPath = path.join(__dirname, '../bearer.txt');
    const bearerToken = fs.readFileSync(tokenPath, 'utf8').trim();

    // Step 1: Get presigned download URL
    const signResponse = await fetch(
      `http://localhost:3000/files/${config.fileId}/signed-url`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    );

    if (!signResponse.ok) {
      const error = await signResponse.text();
      console.error(
        `Failed to get download URL: ${signResponse.status} ${signResponse.statusText}`,
      );
      console.error(error);
      process.exit(1);
    }

    const signedUrl = await signResponse.text();

    // Step 2: Download file from S3
    const downloadResponse = await fetch(signedUrl);

    if (!downloadResponse.ok) {
      const error = await downloadResponse.text();
      console.error(
        `Download failed: ${downloadResponse.status} ${downloadResponse.statusText}`,
      );
      console.error(error);
      process.exit(1);
    }

    // Extract filename from Content-Disposition header or use fileId as fallback
    const contentDisposition = downloadResponse.headers.get(
      'content-disposition',
    );
    let fileName = config.fileId;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) {
        fileName = match[1];
      }
    }

    // Create downloads directory if it doesn't exist
    const downloadsDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(downloadsDir, fileName);
    const buffer = await downloadResponse.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    console.log('Download successful:', {
      fileId: config.fileId,
      fileName: fileName,
      filePath: filePath,
      size: buffer.byteLength,
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

downloadFile();
