import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

const validateSchema = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction): void => {
    const { success, error } = schema.safeParse(req.body);

    if (!success) {
        res.status(401).json({
            status: false,
            message: error.errors.map(t => `${t.path[0] ?? ''}: ${t.message}`).join(', ')
        });
        return;
    }

    next();
}

export default validateSchema;
