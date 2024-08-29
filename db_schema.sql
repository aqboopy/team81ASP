PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;


-- Create a table for liked items
CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    item TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

COMMIT;