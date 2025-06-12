import { Response } from 'express';

export function handlePrismaError(error: any, res: Response) {
    if (error.code === 'ECONNREFUSED') {
        res.status(503).json({ error: 'Database connection refused' });
    } else if (error.code) {
        res.status(500).json({ error: `Database error: ${error.code}` });
    } else {
        res.status(400).json({ error: error.message || 'Unexpected error occurred' });
    }
}
