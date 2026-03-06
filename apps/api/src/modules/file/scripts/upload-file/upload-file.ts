#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';

interface Config {
  filePath: string;
  folder: string;
}

async function uploadFile() {
  try {
    // Read config
    const configPath = path.join(__dirname, './config.json');
    const config: Config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // Read bearer token
    const tokenPath = path.join(__dirname, '../bearer.txt');
    const bearerToken = fs.readFileSync(tokenPath, 'utf8').trim();

    // Check if file exists
    if (!fs.existsSync(config.filePath)) {
      console.error(`File not found: ${config.filePath}`);
      process.exit(1);
    }

    const fileName = path.basename(config.filePath);
    const extension = path.extname(config.filePath).substring(1);
    // const mimeType = FILE_EXTENSION_TO_MIME_TYPE[extension as FileExtension];
    const mimeType = 'application/pdf';

    if (!mimeType) {
      console.error(`Unknown MIME type for extension: ${extension}`);
      process.exit(1);
    }

    const apiUrl = 'https://luxflow-be.onrender.com';

    // Step 1: Get presigned upload URL
    const signResponse = await fetch(`${apiUrl}/files/upload-url`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mime: mimeType,
        fileName: fileName,
        folder: config.folder,
      }),
    });

    if (!signResponse.ok) {
      const error = await signResponse.text();
      console.error(
        `Failed to get upload URL: ${signResponse.status} ${signResponse.statusText}`,
      );
      console.error(error);
      process.exit(1);
    }

    const { presigned, file } = await signResponse.json();

    // Step 2: Upload file to S3 using presigned URL
    const formData = new FormData();
    Object.entries(presigned.fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });

    // Read file as buffer and create a Blob for FormData
    const fileBuffer = fs.readFileSync(config.filePath);
    const fileBlob = new Blob([fileBuffer], { type: mimeType });
    formData.append('file', fileBlob, fileName);

    const uploadResponse = await fetch(presigned.url, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text();
      console.error(
        `Upload to S3 failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
      );
      console.error(error);
      process.exit(1);
    }

    // Step 3: Mark file as uploaded
    const markResponse = await fetch(
      `${apiUrl}/files/${file.id}/mark-uploaded`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${bearerToken}`,
        },
      },
    );

    if (!markResponse.ok) {
      const error = await markResponse.text();
      console.error(
        `Failed to mark as uploaded: ${markResponse.status} ${markResponse.statusText}`,
      );
      console.error(error);
      process.exit(1);
    }

    console.log('Upload successful:', {
      fileId: file.id,
      fileName: fileName,
      folder: config.folder,
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

uploadFile();
