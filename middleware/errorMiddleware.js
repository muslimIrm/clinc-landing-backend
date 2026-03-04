const globalErrorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;
    if (err.code === 11000) {
        statusCode = 400;
        message = "عذراً، كود الحجز هذا مستخدم بالفعل أو حدث تداخل. يرجى المحاولة مرة أخرى.";
    }
    
    
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }


    res.status(statusCode).json({
        success: false,
        message: message,
        
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export default globalErrorHandler;