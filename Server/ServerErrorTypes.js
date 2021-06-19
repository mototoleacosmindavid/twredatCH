module.exports = {
    REQUEST_TOO_LARGE: {
        message: 'Request is too large.',
        statusCode: 413,
        helper: null
    },
    HTTP_METHOD_NOT_SUPPORTED: {
        message: 'Http method not allowed.',
        statusCode: 501,
        helper: null
    },
    SERVER_ROUTE_NOT_IMPLEMENTED: {
        message: 'Server route not implemented',
        statusCode: 501,
        helper: null
    },
    SERVER_INTERNAL_ERROR: {
        message: 'Internal server error',
        statusCode: 500,
        helper: null
    },
    BAD_CREDENTIALS: {
        message: 'Bad credentials',
        statusCode: 401,
        helper: null
    },
    DATABASE_ERROR: {
        message: 'Database Error',
        statusCode: 401,
        helper: null
    },
    BAD_REQUEST: {
        message: 'Bad client request',
        statusCode: 400,
        helper: null
    },
    AUTHORIZATION_HEADER_MISSING: {
        message: 'Authorization header missing',
        statusCode: 401,
        helper: null
    },
    INVALID_AUTH_TOKEN: {
        message: 'Invalid authentication token',
        statusCode: 401,
        helper: null
    },
}