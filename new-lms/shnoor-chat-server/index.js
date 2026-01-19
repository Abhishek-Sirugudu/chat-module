const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const pool = require('./db');
const multer = require('multer');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

require('dotenv').config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const runMigrations = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        file_id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        mime_type TEXT NOT NULL,
        data BYTEA NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const checkCols = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='messages' AND column_name='attachment_file_id';
    `);

    if (checkCols.rows.length === 0) {
      await pool.query(`
        ALTER TABLE messages 
        ADD COLUMN is_read BOOLEAN DEFAULT FALSE,
        ADD COLUMN attachment_file_id INT REFERENCES files(file_id);
      `);
      console.log("Migrations applied: Added file columns.");
    }

    const checkFcm = await pool.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name='users' AND column_name='fcm_token';
    `);

    if (checkFcm.rows.length === 0) {
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN fcm_token TEXT;
      `);
      console.log("Migrations applied: Added fcm_token column.");
    }
  } catch (err) {
    console.error("Migration Error:", err);
  }
};
runMigrations();

const getPostgresId = async (firebaseUid) => {
  const res = await pool.query("SELECT user_id FROM users WHERE firebase_uid = $1", [firebaseUid]);
  return res.rows.length > 0 ? res.rows[0].user_id : null;
};

app.post('/api/sync-user', async (req, res) => {
  const { firebase_uid, email, full_name, role } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users (firebase_uid, email, full_name, role, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (firebase_uid) DO UPDATE SET email = $2, full_name = $3
       RETURNING user_id, role`,
      [firebase_uid, email, full_name, role]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Sync Error:", err);
    res.status(500).send(err.message);
  }
});

app.post('/api/save-fcm-token', async (req, res) => {
  const { firebase_uid, fcm_token } = req.body;
  try {
    const userId = await getPostgresId(firebase_uid);
    if (!userId) return res.status(404).json({ error: "User not found" });

    await pool.query(
      "UPDATE users SET fcm_token = $1 WHERE user_id = $2",
      [fcm_token, userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("FCM Token Error:", err);
    res.status(500).send(err.message);
  }
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const { originalname, mimetype, buffer } = req.file;
    const newFile = await pool.query(
      "INSERT INTO files (filename, mime_type, data) VALUES ($1, $2, $3) RETURNING file_id",
      [originalname, mimetype, buffer]
    );

    res.json({ file_id: newFile.rows[0].file_id });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).send("File upload failed");
  }
});

app.get('/api/files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await pool.query("SELECT * FROM files WHERE file_id = $1", [id]);

    if (file.rows.length === 0) return res.status(404).send("File not found");

    const { mime_type, data, filename } = file.rows[0];
    res.setHeader('Content-Type', mime_type);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(data);
  } catch (err) {
    console.error("File Serve Error:", err);
    res.status(500).send("Error serving file");
  }
});

app.get('/api/chats', async (req, res) => {
  const { firebase_uid } = req.query;
  try {
    const userId = await getPostgresId(firebase_uid);
    if (!userId) return res.status(404).json({ error: "User not found" });

    const query = `
      SELECT c.chat_id, c.created_at,
        CASE WHEN c.student_id = $1 THEN i.full_name ELSE s.full_name END as recipient_name,
        CASE WHEN c.student_id = $1 THEN i.firebase_uid ELSE s.firebase_uid END as recipient_uid,
        (SELECT COUNT(*)::int FROM messages m WHERE m.chat_id = c.chat_id AND m.receiver_id = $1 AND m.is_read = FALSE) as unread_count
      FROM chats c
      JOIN users s ON c.student_id = s.user_id
      JOIN users i ON c.instructor_id = i.user_id
      WHERE c.student_id = $1 OR c.instructor_id = $1
      ORDER BY c.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post('/api/chats', async (req, res) => {
  const { student_firebase_uid, instructor_firebase_uid } = req.body;
  try {
    const studentId = await getPostgresId(student_firebase_uid);
    const instructorId = await getPostgresId(instructor_firebase_uid);

    if (!studentId || !instructorId) return res.status(404).send("Users not found");

    const check = await pool.query(
      "SELECT chat_id FROM chats WHERE student_id = $1 AND instructor_id = $2",
      [studentId, instructorId]
    );

    if (check.rows.length > 0) return res.json({ chat_id: check.rows[0].chat_id, isNew: false });

    const newChat = await pool.query(
      "INSERT INTO chats (student_id, instructor_id) VALUES ($1, $2) RETURNING chat_id",
      [studentId, instructorId]
    );
    res.json({ chat_id: newChat.rows[0].chat_id, isNew: true });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/api/messages/:chatId', async (req, res) => {
  const { chatId } = req.params;
  try {
    const query = `
      SELECT m.message_id, m.text, m.created_at, m.is_read, u.firebase_uid as sender_uid,
             m.attachment_file_id, f.filename as attachment_name, f.mime_type as attachment_type
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      LEFT JOIN files f ON m.attachment_file_id = f.file_id
      WHERE m.chat_id = $1
      ORDER BY m.created_at ASC
    `;
    const result = await pool.query(query, [chatId]);

    const messages = result.rows.map(msg => ({
      ...msg,
      attachment_url: msg.attachment_file_id ? `http://localhost:3001/api/files/${msg.attachment_file_id}` : null
    }));

    res.json(messages);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/api/messages/mark-read', async (req, res) => {
  const { chat_id, user_firebase_uid } = req.body;
  try {
    const userId = await getPostgresId(user_firebase_uid);
    if (!userId) return res.status(400).send("User invalid");
    await pool.query(
      "UPDATE messages SET is_read = TRUE WHERE chat_id = $1 AND receiver_id = $2 AND is_read = FALSE",
      [chat_id, userId]
    );
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_chat', (chatId) => { socket.join(chatId); });
  socket.on('join_user', (userId) => { socket.join(userId); });

  socket.on('send_message', async (data) => {
    const { chat_id, text, sender_firebase_uid, receiver_firebase_uid, attachment_file_id } = data;
    try {
      const senderId = await getPostgresId(sender_firebase_uid);
      const receiverId = await getPostgresId(receiver_firebase_uid);

      if (!senderId || !receiverId) return;

      const savedMsg = await pool.query(
        `INSERT INTO messages (chat_id, sender_id, receiver_id, text, is_read, attachment_file_id) 
         VALUES ($1, $2, $3, $4, FALSE, $5) 
         RETURNING message_id, text, created_at, attachment_file_id`,
        [chat_id, senderId, receiverId, text || '', attachment_file_id || null]
      );

      let fileData = {};
      if (attachment_file_id) {
        const f = await pool.query("SELECT filename, mime_type FROM files WHERE file_id = $1", [attachment_file_id]);
        if (f.rows.length > 0) {
          fileData = {
            attachment_name: f.rows[0].filename,
            attachment_type: f.rows[0].mime_type,
            attachment_url: `http://localhost:3001/api/files/${attachment_file_id}`
          };
        }
      }

      const messagePayload = {
        ...savedMsg.rows[0],
        ...fileData,
        chat_id,
        sender_uid: sender_firebase_uid,
        receiver_uid: receiver_firebase_uid,
        client_side_id: data.client_side_id
      };

      io.to(chat_id).emit('receive_message', messagePayload);
      io.to(receiver_firebase_uid).emit('new_notification', messagePayload);

      const receiver = await pool.query("SELECT fcm_token FROM users WHERE user_id = $1", [receiverId]);
      const fcmToken = receiver.rows[0]?.fcm_token;

      if (fcmToken) {
        const messageBody = text || (attachment_file_id ? "Sent an attachment" : "New Message");
        const senderNameRes = await pool.query("SELECT full_name FROM users WHERE user_id = $1", [senderId]);
        const senderName = senderNameRes.rows[0]?.full_name || "New Message";

        try {
          await admin.messaging().send({
            token: fcmToken,
            notification: {
              title: senderName,
              body: messageBody,
            },
            data: {
              chat_id: String(chat_id),
              sender_uid: sender_firebase_uid
            }
          });
          console.log("FCM Sent to:", receiver_firebase_uid);
        } catch (fcmErr) {
          console.error("FCM Send Error:", fcmErr);
        }
      }

    } catch (err) {
      console.error("Message Error:", err);
    }
  });

  socket.on('disconnect', () => { console.log('User Disconnected', socket.id); });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Chat Server running on port ${PORT}`);
});