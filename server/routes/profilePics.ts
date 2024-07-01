export {}

import { Request, Response } from 'express';

const Profiles = require("../model/Profile.ts")

require('dotenv').config({ path: 'aws.env' }); // Load environment variables from aws.env file

// Middleware for file uploads
import { Multer } from 'multer';
const multer = require('multer');

// Initialize multer with desired configuration
const upload: Multer = multer();

// Initialize instance of express
const router = require('express').Router();

// AWS S3 Client Classes
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");

// Initialize Universally Unique Identifier to generate a unique key for profile photos
const { v4: uuidv4 } = require('uuid');

// Configure the AWS SDK with environment variables
const client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY 
  }
});


// Update 'image.jpeg' with parameter name passed in
router.post('/upload/:objectID', upload.single('profilePicture'), async (req: Request, res: Response) => {
  try {
    const objectID = req.params.objectID;
    const fileContent = (req.file as Express.Multer.File).buffer; // Cast req.file to the correct type
    if (!fileContent) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Load bucket name from aws.env
    const bucketName = process.env.AWS_PROFILE_BUCKET_NAME;

    // Generate a unique key for the uploaded image
    const key = `${uuidv4()}`;

    // Check if both bucket name and key are provided
    if (!bucketName || !key) {
      return res.status(400).json({ error: 'Bucket name and key are required' });
    }

    const response = await uploadToS3(fileContent, bucketName, key);
    
    if (response) {
      // Update the user document in MongoDB with the profile picture key
      await Profiles.findByIdAndUpdate(objectID, { profilePicKey: key });

      res.status(200).json({ 
        message: 'Profile picture uploaded successfully',
        key: key,
      });
    }
    
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).send("Error uploading file to S3");
  }
});

// PUT endpoint to update a profile picture
router.put('/update/:objectID/:key', upload.single('profilePicture'), async (req: Request, res: Response) => {
  try {
    const objectID = req.params.objectID;
    const key = req.params.key;
    const fileContent = (req.file as Express.Multer.File).buffer; // Cast req.file to the correct type

    if (!key || !fileContent) {
      return res.status(400).json({ error: 'Key and file content are required' });
    }

    const bucketName = process.env.AWS_PROFILE_BUCKET_NAME;

    const response = await uploadToS3(fileContent, bucketName!, key);

    if (response) {
      // Update the user document in MongoDB with the profile picture key
      await Profiles.findByIdAndUpdate(objectID, { profilePicKey: key });

      res.status(200).json({ message: 'Profile picture updated successfully'});
    }
  } catch (err) {
    console.error('Error updating profile picture:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve a profile picture
router.get('/get/:key', async (req: Request, res: Response) => {
  try {
    const key = req.params.key;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const bucketName = process.env.AWS_PROFILE_BUCKET_NAME;

    // Retrieve the file from S3 bucket based on the key
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });

    const response = await client.send(command);

    /*
  * Retrieve the image from the S3 bucket based on the provided key.
  * If the image is found, you have two options for sending the response:
  * 1. Send back the S3 URL of the image:
  *    res.status(200).json({ imageUrl: `http://tutorhubprofilepics.s3.amazonaws.com/${key}` });
  * 2. Send the image file itself:
  *    - Set the appropriate headers for the file:
  *      res.set('Content-Type', response.ContentType);
  *      res.set('Content-Disposition', `attachment; filename="${key}"`);
  *    - Send the binary data of the image in the response body:
  *      res.status(200).send(response.Body);
  */
    res.status(200).json({ imageUrl: `https://tutorhubprofilepics.s3.amazonaws.com/${key}` });

  } catch (err) {
    console.error('Error retrieving profile picture:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE endpoint to delete a profile picture
router.delete('/delete/:objectID/:key', async (req: Request, res: Response) => {
  try {

    const objectID = req.params.objectID;
    const key = req.params.key;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const bucketName = process.env.AWS_PROFILE_BUCKET_NAME;

    // Create a command to delete the object
    const command = new DeleteObjectCommand({ Bucket: bucketName, Key: key });

    // Send the command to S3
    const response = await client.send(command);

    // Assuming profilePictureID is the field storing the profile picture ID
    await Profiles.findByIdAndUpdate(objectID, { profilePicKey: null }); 

    // Send appropriate response based on the deletion result
    res.status(200).json({ message: 'Profile picture deleted successfully' });
  } catch (err) {
    console.error('Error deleting profile picture:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const uploadToS3 = async (fileContent: Buffer, bucketName: string, key: string) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
  });

  try {
    const response = await client.send(command);
    return response;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

module.exports = router;

