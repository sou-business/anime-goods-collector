CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    detail_url TEXT,
    image_url TEXT,
    price NUMERIC(10, 0)
);