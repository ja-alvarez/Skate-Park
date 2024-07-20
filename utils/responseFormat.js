const responseFormat = (res, url, message, status) => {

    if (url.includes('/api')) {
        res.status(status).json({
            message
        })
    } else {
        res.render('error', {
            message
        })
    }
};

export default responseFormat;