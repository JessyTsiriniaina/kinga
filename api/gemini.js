import { GoogleGenAI } from '@google/genai';

const MODEL_NAME = 'gemini-2.5-flash'; 
const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
    throw new Error("La variable d'environnement GEMINI_API_KEY n'est pas définie.");
}

const ai = new GoogleGenAI({ apiKey });

export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send({ message: 'Seules les requêtes POST sont autorisées.' });
    }

    try {
        const { prompt, history } = req.body;
        if (!prompt) {
            return res.status(400).send({ message: 'Le champ "prompt" est requis.' });
        }

        const contents = formatHistory(history, prompt.text);

        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: contents,
        });

        res.status(200).json({ text: response.text });

    } catch (error) {
        console.error("Erreur Gemini :", error);

        if (error.status === 429 || error.message.includes('429')) {
            return res.status(429).json({ 
                message: "Quota de l'API Gemini dépassé. Veuillez réessayer dans quelques instants." 
            });
        }
        
        res.status(500).json({ 
            message: "Une erreur interne s'est produite lors de la communication avec l'API Gemini." 
        });
    }
};

function formatHistory(history, newPromptText) {
    
    const geminiHistory = history.map(message => ({
        role: message.type === 'prompt' ? 'user' : 'model',
        parts: [{ text: message.text }],
    }));

    geminiHistory.push({
        role: 'user',
        parts: [{ text: newPromptText }],
    });

    return geminiHistory;
}


/**
 * import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY; 

if (!apiKey) {
    throw new Error("La variable d'environnement GEMINI_API_KEY n'est pas définie.");
}

const ai = new GoogleGenAI({ apiKey });

function formatHistory(history, newPromptText) {
    
    const geminiHistory = history.map(message => ({
        role: message.type === 'prompt' ? 'user' : 'model',
        parts: [{ text: message.text }],
    }));

    geminiHistory.push({
        role: 'user',
        parts: [{ text: newPromptText }],
    });

    return geminiHistory;
}

export default async function handler(req, res) {

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { prompt, history } = req.body;
        
        const newPromptText = prompt.text;
        
        const contents = formatHistory(history, newPromptText);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {}
        });

        if (!response || !response.candidates || response.candidates.length === 0) {
            return res.status(400).json({ 
                error: 'Réponse vide ou bloquée.',
                candidates: [{ content: { parts: [{ text: 'Je ne peux pas répondre à cette requête pour le moment.' }] } }]
            });
        }
        
        res.status(200).json(response);

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Gemini:", error);
        
        res.status(500).json({ 
            error: 'Erreur interne du serveur.',
            candidates: [{ content: { parts: [{ text: 'Erreur interne du serveur. Veuillez réessayer plus tard.' }] } }]
        });
    }
}
 */