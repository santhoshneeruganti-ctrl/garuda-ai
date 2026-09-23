import sqlite3


# =====================================
# Database Configuration
# =====================================

DATABASE = "garuda.db"


# =====================================
# Database Connection
# =====================================

connection = sqlite3.connect(
    DATABASE,
    check_same_thread=False
)

connection.row_factory = sqlite3.Row


def get_cursor():
    """
    Return a new SQLite cursor.
    """
    return connection.cursor()


# Global cursor
cursor = connection.cursor()


# =====================================
# Users Table
# =====================================

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
    )
    """
)


# =====================================
# Chats Table
# =====================================

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
)


# =====================================
# Messages Table
# =====================================

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER,
        sender TEXT,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(chat_id) REFERENCES chats(id)
    )
    """
)


# =====================================
# Messages Table Migration
# =====================================

cursor.execute(
    "PRAGMA table_info(messages)"
)

message_columns = [
    column[1]
    for column in cursor.fetchall()
]


# Add PDF reference to messages
if "pdf_id" not in message_columns:

    cursor.execute(
        """
        ALTER TABLE messages
        ADD COLUMN pdf_id INTEGER
        """
    )

    print(
        "✅ Added pdf_id column "
        "to messages"
    )


# =====================================
# PDFs Table
# =====================================

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS pdfs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
)


# =====================================
# PDFs Table Migration
# =====================================

cursor.execute(
    "PRAGMA table_info(pdfs)"
)

pdf_columns = [
    column[1]
    for column in cursor.fetchall()
]


# Add active/inactive PDF tracking
if "is_active" not in pdf_columns:

    cursor.execute(
        """
        ALTER TABLE pdfs
        ADD COLUMN is_active INTEGER DEFAULT 1
        """
    )

    print(
        "✅ Added is_active column "
        "to pdfs"
    )


# =====================================
# PDF Chunks Table
# =====================================

cursor.execute(
    """
    CREATE TABLE IF NOT EXISTS pdf_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pdf_id INTEGER NOT NULL,
        chunk_index INTEGER NOT NULL,
        chunk_text TEXT NOT NULL,
        FOREIGN KEY(pdf_id)
            REFERENCES pdfs(id)
            ON DELETE CASCADE
    )
    """
)


# =====================================
# PDF Chunks Table Migration
# =====================================

cursor.execute(
    "PRAGMA table_info(pdf_chunks)"
)

pdf_chunk_columns = [
    column[1]
    for column in cursor.fetchall()
]


# -------------------------------------
# Add Embedding Column
# -------------------------------------

if "embedding" not in pdf_chunk_columns:

    cursor.execute(
        """
        ALTER TABLE pdf_chunks
        ADD COLUMN embedding BLOB
        """
    )

    print(
        "✅ Added embedding column "
        "to pdf_chunks"
    )


# -------------------------------------
# Add Page Number Column
# -------------------------------------

if "page_number" not in pdf_chunk_columns:

    cursor.execute(
        """
        ALTER TABLE pdf_chunks
        ADD COLUMN page_number INTEGER
        """
    )

    print(
        "✅ Added page_number column "
        "to pdf_chunks"
    )


# =====================================
# Helpful Database Indexes
# =====================================

cursor.execute(
    """
    CREATE INDEX IF NOT EXISTS
    idx_messages_chat_id
    ON messages(chat_id)
    """
)

cursor.execute(
    """
    CREATE INDEX IF NOT EXISTS
    idx_pdfs_chat_id
    ON pdfs(chat_id)
    """
)

cursor.execute(
    """
    CREATE INDEX IF NOT EXISTS
    idx_pdf_chunks_pdf_id
    ON pdf_chunks(pdf_id)
    """
)


# =====================================
# Save All Changes
# =====================================

connection.commit()


print(
    "🦅 Garuda database initialized successfully"
)


# =====================================
# IMPORTANT
# =====================================

# Do NOT close the global connection here.
#
# The rest of the Garuda backend uses:
#
#     connection
#     get_cursor()
#
# throughout the application.