const pool = require('./db');
require('dotenv').config();

const fixReadStatus = async () => {
    try {
        console.log("Updating all existing messages to READ...");
        const res = await pool.query("UPDATE messages SET is_read = TRUE");
        console.log(`Updated ${res.rowCount} messages.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixReadStatus();
