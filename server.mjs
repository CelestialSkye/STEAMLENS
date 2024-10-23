import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Get the __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the current directory
app.use(express.static(__dirname));

// RAWG API key
const API_KEY = 'bb6548a777cb4af0945238e67619bfcd';

// Route to handle search queries
app.get('/search', async (req, res) => {
    const searchQuery = req.query.q;
    const url = `https://api.rawg.io/api/games?key=${API_KEY}&search=${searchQuery}`;

    try {
        const response = await fetch(url); // Using the native fetch API
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data from RAWG API:', error);
        res.status(500).send('Server Error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
