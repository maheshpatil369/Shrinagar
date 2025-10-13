    // Backend/middleware/validationMiddleware.js
    import { body, validationResult } from 'express-validator';

    const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
    };

    const validateRegistration = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    handleValidationErrors,
    ];

    const validateLogin = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors,
    ];

    const validateSellerRegistration = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    body('businessName').notEmpty().withMessage('Business name is required'),
    body('gstNumber').notEmpty().withMessage('GST number is required'),
    body('panNumber').notEmpty().withMessage('PAN number is required'),
    handleValidationErrors,
    ];

    const validateProduct = [
        body('name').notEmpty().withMessage('Product name is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('price').isNumeric().withMessage('Price must be a number'),
        body('category').notEmpty().withMessage('Category is required'),
        handleValidationErrors
    ]

    export { validateRegistration, validateLogin, validateSellerRegistration, validateProduct, handleValidationErrors };

