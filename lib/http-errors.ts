export class RequestError extends Error {
    statusCode: number;
    errors?: Record<string, string[]>;

    constructor(
        statusCode: number,
        message: string,
        errors?: Record<string, string[]>
    ) {
        super(message); //passes the message to the base Error class
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = "RequestError";
    }
}

export class ValidationError extends RequestError {
    constructor(fieldErrors: Record<string, string[]>) {
        const message = ValidationError.formatFieldErrors(fieldErrors);
        super(400, message, fieldErrors);
        this.name = "ValidationError";
        this.errors = fieldErrors;
    }

    static formatFieldErrors(errors: Record<string, string[]>): string {
        const formattedMessages = Object.entries(errors).map(
            ([field, messages]) => {
                const fieldName =
                    field.charAt(0).toUpperCase() + field.slice(1);
                if (messages[0] === "required") {
                    return `${fieldName} is required`;
                } else {
                    return messages.join(" and ");
                }
            }
        );
        return formattedMessages.join(", ");
    }
}
export class NotFoundError extends RequestError {
    constructor(resourse: string) {
        super(404, `${resourse} not found`);
        this.name = "NotFoundError";
    }
}
export class UnauthorizedError extends RequestError {
    constructor(message: string = "Unauthorized access") {
        super(401, message);
        this.name = "UnauthorizedError";
    }
}
export class ForbiddenError extends RequestError {
    constructor(message: string = "Forbidden access") {
        super(403, message);
        this.name = "ForbiddenError";
    }
}
