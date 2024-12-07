CREATE TABLE shared_favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  shared_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);
