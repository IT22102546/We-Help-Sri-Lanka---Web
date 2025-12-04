export const getMessages = async (req, res) => {
  const { roomId } = req.params;

  try {
    const [rows] = await req.db.execute(
      `SELECT * FROM messages WHERE room_id = ? ORDER BY timestamp ASC`,
      [roomId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Get Messages Error:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const postMessage = async (req, res) => {
  const { roomId, senderId, receiverId, message, timestamp } = req.body;

  try {
    await req.db.execute(
      `INSERT INTO messages (room_id, sender_id, receiver_id, message, timestamp)
         VALUES (?, ?, ?, ?, ?)`,
      [roomId, senderId, receiverId, message, timestamp]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    console.error("Post Message Error:", err);
    res.status(500).json({ message: "Failed to save message" });
  }
};

export const getChatRooms = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const [rows] = await req.db.execute(
      `
      SELECT 
        m.*,
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE room_id = m.room_id AND receiver_id = ? AND seen = false
        ) AS unread_count
      FROM (
        SELECT 
          room_id,
          MAX(timestamp) AS last_timestamp
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY room_id
      ) AS latest
      JOIN messages m ON m.room_id = latest.room_id AND m.timestamp = latest.last_timestamp
      JOIN customers u ON u.id = IF(m.sender_id = ?, m.receiver_id, m.sender_id)
      ORDER BY m.timestamp DESC
      `,
      [userId, userId, userId, userId]
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Chat room fetch error:", err);
    res.status(500).json({ message: "Failed to load chat rooms" });
  }
};

export const markMessagesAsSeen = async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    await req.db.execute(
      `UPDATE messages SET seen = true WHERE room_id = ? AND receiver_id = ? AND seen = false`,
      [roomId, userId]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Mark as seen error:", err);
    res.status(500).json({ message: "Failed to update messages" });
  }
};
