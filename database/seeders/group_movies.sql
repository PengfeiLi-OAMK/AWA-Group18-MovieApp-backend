-- Create groupMovies table
CREATE TABLE IF NOT EXISTS groupMovies (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL,
    movie_id INTEGER NOT NULL,
    posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (movie_id) REFERENCES films(id) ON DELETE CASCADE
);
