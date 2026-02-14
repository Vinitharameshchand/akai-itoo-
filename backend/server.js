import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5003;
const DATA_FILE = path.join(__dirname, 'data', 'waitlist.json');

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173' || 'https://akai-itoo.vercel.app';
app.use(cors({ origin: [FRONTEND_URL, 'https://akai-itoo.vercel.app'] }));
app.use(express.json());



// Create nodemailer transporter (fallback to ethereal test account when no SMTP config)
let transporter;
async function createTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
        return;
    }

    // Fallback to Ethereal test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        }
    });
    console.log('Using Ethereal test account for emails. Preview URL will be logged.');
}

createTransporter().catch((err) => console.error('Error creating mail transporter', err));

async function sendConfirmationEmail(user) {
    if (!transporter) await createTransporter();

    const fromName = process.env.FROM_NAME || 'VibeAura';
    const fromEmail = process.env.FROM_EMAIL || (process.env.SMTP_USER || 'no-reply@vibeaura.com');

    const mailOptions = {
        from: `${fromName} <${fromEmail}>`,
        to: user.email,
        subject: 'Welcome — You joined the VibeAura waitlist 💕',
        text: `Hi ${user.name || ''},\n\nThanks for joining the VibeAura waitlist! We'll send updates and early access info to this email.\n\nLove,\nThe VibeAura Team`,
        html: `<p>Hi ${user.name || ''},</p><p>Thanks for joining the <strong>VibeAura</strong> waitlist! We'll send updates and early access info to this email.</p><p>Love,<br/>The VibeAura Team</p>`
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        // If using Ethereal, log preview URL
        if (nodemailer.getTestMessageUrl && info) {
            const preview = nodemailer.getTestMessageUrl(info);
            if (preview) console.log('Preview email at:', preview);
        }
        return { ok: true };
    } catch (err) {
        console.error('Error sending confirmation email:', err);
        return { ok: false, error: err };
    }
}

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
        // Send response immediately
        res.json({ success: true, message: 'Successfully joined the waitlist!' });

        // Send confirmation email in background
        sendConfirmationEmail(newUser).catch(mailErr => {
            console.error('Background mail error:', mailErr);
        });
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
