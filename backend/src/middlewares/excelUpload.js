import multer from 'multer';

// Store file in memory (buffer) — we parse it with xlsx, never save to disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    // Accept only .xlsx and .csv
    const allowed = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel',                                           // .xls
        'text/csv',                                                           // .csv
        'application/csv',
    ];

    if (allowed.includes(file.mimetype) ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls') ||
        file.originalname.endsWith('.csv')) {
        cb(null, true);
    } else {
        cb(new Error('Only .xlsx, .xls, and .csv files are allowed'), false);
    }
};

export const excelUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});
