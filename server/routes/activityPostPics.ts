export {}

const ActivityPosts = require("../model/ActivityPost")

require('dotenv').config({ path: '.env' }); // Load environment variables from aws.env file

// Middleware for file uploads
const multer = require('multer');

// Initialize multer with desired configuration
const upload: any = multer();

// Initialize instance of express
const router = require('express').Router();

// AWS S3 Client Classes
const { PutObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } = require("@aws-sdk/client-s3");

// Initialize Universally Unique Identifier to generate a unique key for activity post photos
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
router.post('/upload/:objectID', upload.single('activityPostPicture'), async (req: any, res: any) => {
  try {
    const objectID = req.params.objectID;
    const fileContent = req.file.buffer; // Cast req.file to the correct type

    if (!fileContent) {
      return res.status(400).json({ error: 'File is required' });
    }

    // Load bucket name from aws.env
    const bucketName = process.env.AWS_ACTIVITY_POST_BUCKET_NAME;

    // Generate a unique key for the uploaded image
    const key = `${uuidv4()}`;

    // Check if both bucket name and key are provided
    if (!bucketName || !key) {
      return res.status(400).json({ error: 'Bucket name and key are required' });
    }

    const any = await uploadToS3(fileContent, bucketName, key);
    
    if (any) {
      // Update the user document in MongoDB with the activity post picture key
      await ActivityPosts.findByIdAndUpdate(objectID, { activityPostPicKey: key });

      res.status(200).json({ message: 'activity post picture uploaded successfully'});
    }
    
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).send("Error uploading file to S3");
  }
});

// PUT endpoint to update a activity post picture
router.put('/update/:objectID/:key', upload.single('activityPostPicture'), async (req: any, res: any) => {
  try {
    const objectID = req.params.objectID;
    const key = req.params.key;
    const fileContent = req.file.buffer; // Cast req.file to the correct type

    if (!key || !fileContent) {
      return res.status(400).json({ error: 'Key and file content are required' });
    }

    const bucketName = process.env.AWS_ACTIVITY_POST_BUCKET_NAME;

    const any = await uploadToS3(fileContent, bucketName!, key);

    if (any) {
      // Update the user document in MongoDB with the activity post picture key
      await ActivityPosts.findByIdAndUpdate(objectID, { activityPostPicKey: key });

      res.status(200).json({ message: 'activity post picture updated successfully'});
    }
  } catch (err) {
    console.error('Error updating activity post picture:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve a activity post picture
router.get('/get/:key', async (req: any, res: any) => {
  try {
    const key = req.params.key;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const bucketName = process.env.AWS_ACTIVITY_POST_BUCKET_NAME;

    // Retrieve the file from S3 bucket based on the key
    const command = new GetObjectCommand({ Bucket: bucketName, Key: key });

    const any = await client.send(command);

    /*
  * Retrieve the image from the S3 bucket based on the provided key.
  * If the image is found, you have two options for sending the any:
  * 1. Send back the S3 URL of the image:
  *    res.status(200).json({ activityPostPicKey: `http://tutorhubactivitypostpics.s3.amazonaws.com/${key}` });
  * 2. Send the image file itself:
  *    - Set the appropriate headers for the file:
  *      res.set('Content-Type', any.ContentType);
  *      res.set('Content-Disposition', `attachment; filename="${key}"`);
  *    - Send the binary data of the image in the any body:
  *      res.status(200).send(any.Body);
  */
    res.status(200).json({ activityPostPicKey: `https://tutorhubactivitypostpics.s3.amazonaws.com/${key}` });

  } catch (err) {
    console.error('Error retrieving activity post picture:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE endpoint to delete a activity post picture
router.delete('/delete/:objectID/:key', async (req: any, res: any) => {
  try {

    const objectID = req.params.objectID;
    const key = req.params.key;

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const bucketName = process.env.AWS_ACTIVITY_POST_BUCKET_NAME;

    // Create a command to delete the object
    const command = new DeleteObjectCommand({ Bucket: bucketName, Key: key });

    // Send the command to S3
    const any = await client.send(command);

    // Assuming activityPostPictureID is the field storing the activity post picture ID
    await ActivityPosts.findByIdAndUpdate(objectID, { activityPostPicKey: null }); 

    // Send appropriate any based on the deletion result
    res.status(200).json({ message: 'activity post picture deleted successfully' });
  } catch (err) {
    console.error('Error deleting activity post picture:', err);
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
    const any = await client.send(command);
    console.log("File uploaded successfully:", any);
    return any;
  } catch (err) {
    console.error("Error uploading file:", err);
    throw err;
  }
};

module.exports = router;

