import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5003;
const DATA_FILE = path.join(__dirname, 'data', 'waitlist.json');

app.use(cors());
app.use(express.json());

// Ensure data file exists
async function initDataFile() {
    try {
        if (!await fs.pathExists(DATA_FILE)) {
            await fs.writeJson(DATA_FILE, []);
            console.log('Created waitlist.json');
        }
    } catch (err) {
        console.error('Error initializing data file:', err);
    }
}

initDataFile();

app.post('/api/waitlist', async (req, res) => {
    const { name, email, role } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        const waitlist = await fs.readJson(DATA_FILE);

        // Check if already exists
        if (waitlist.some(user => user.email === email)) {
            return res.status(400).json({ success: false, message: 'You are already on the waitlist!' });
        }

        const newUser = {
            name,
            email,
            role: role || 'user',
            timestamp: new Date().toISOString()
        };

        waitlist.push(newUser);
        await fs.writeJson(DATA_FILE, waitlist, { spaces: 2 });

        console.log(`New user added to waitlist: ${email}`);
        res.json({ success: true, message: 'Successfully joined the waitlist!' });
    } catch (err) {
        console.error('Error saving to waitlist:', err);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
    }
});

app.get('/api/waitlist', async (req, res) => {
    try {
        const waitlist = await fs.readJson(DATA_FILE);
        res.json(waitlist);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error reading waitlist' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
