from app.database.database import cursor


def get_user_details(username: str):

    cursor.execute(
        """
        SELECT username, email
        FROM users
        WHERE username = ?
        """,
        (username,)
    )

    user = cursor.fetchone()

    if user is None:
        return None

    return {
        "username": user[0],
        "email": user[1]
    }