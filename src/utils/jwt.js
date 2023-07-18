import jwt from 'jsonwebtoken';

const createAccessToken = (payload) => {
    try {
        const token = jwt.sign(payload, process.env.JWT_ACCESS_KEY, {
            expiresIn: process.env.JWT_ACCESS_LIFETIME,
        })
        return token;
    } catch (err) {
        throw err;
    }
}   

const verifyAccessToken = (token) => {
    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_KEY);
        return payload;
    } catch (err) {
        throw err;
    }
}

const storeAccessToken = (res, accessToken) => {
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        expires: new Date(Date.now() + parseInt(process.env.JWT_ACCESS_COOKIE_LIFETIME)),
    });
}

const removeAccessToken = (res) => {
    res.cookie('accessToken', 'logged out', {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        signed: true,
        expires: new Date(Date.now()),
    });
}

export {
    createAccessToken,
    verifyAccessToken,
    storeAccessToken,
    removeAccessToken
};
