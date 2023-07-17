const express = require('express');
const mongoose = require('mongoose');
const shortid = require('shortid');
require('dotenv').config();
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors())

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Create URL schema
const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, default: shortid.generate },
});

const URL = mongoose.model('URL', urlSchema);

// API endpoints
app.use(express.json());

app.post('/api/shorten', async (req, res) => {
    const { originalUrl } = req.body;

    try {
        const existingUrl = await URL.findOne({ originalUrl });
        if (existingUrl) {
            res.json(existingUrl);
        } else {
            const newUrl = new URL({ originalUrl });
            await newUrl.save();
            res.json(newUrl);
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/:shortUrl', async (req, res) => {
    const { shortUrl } = req.params;

    try {
        const url = await URL.findOne({ shortUrl });
        if (url) {
            res.redirect(url.originalUrl);
        } else {
            res.status(404).json({ error: 'URL not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
