const jwt = require('jsonwebtoken');
const JWT_SECRET = 'cnkdnvkrmnkvr';

const userfetching = (requiredRole) => (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;

        if (requiredRole && req.user.role !== requiredRole) {
            return res.status(403).send({ error: "Access denied" });
        }

        next();
    } catch (error) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }
};

module.exports = userfetching;
