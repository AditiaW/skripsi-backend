/**
 * Represents the full User object stored in the database.
 */
export interface User {
    id: string;
    name?: string;
    email: string;
    role?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

declare global {
    namespace Express {
        // Extend Request to include a user field with id, email, and role
        interface Request {
            user?: UserTokenPayload;
        }
    }
}

/**
 * Represents the user data included in JWT payloads.
 * Contains only the minimal necessary properties.
 */
export type UserTokenPayload = Pick<User, 'id' | 'email' | 'role' | 'name'>;
