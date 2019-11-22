const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");

module.exports = {
    success: data => ({ status: 200, data }),
    error: (label, error) => {
        try {
            console.error(new Date().toISOString(), label, error);
            const handler = (status, name, message) => ({
                status,
                error: { name, message }
            });
            if (error instanceof RangeError)
                return handler(
                    508,
                    "RangeError",
                    "Check the syntax of your request. Circular responses are not allowed."
                );
            if (error instanceof TypeError)
                return handler(
                    500,
                    "TypeError",
                    "Sorry, we couldn't understand your request."
                );
            if (error instanceof TokenExpiredError)
                return handler(440, error.name, error.message);
            if (error instanceof JsonWebTokenError)
                return handler(511, error.name, error.message);
            return handler(500, error.name, error.message);
        } catch (error) {
            return handler(
                500,
                "Unknown error",
                `An unknown error was encountered at label '${label}'`
            );
        }
    }
};
