-- ============================================================
-- Create Tables with Subtask Support
-- ============================================================

CREATE TABLE developers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- junction table (many-to-many)
CREATE TABLE developer_skills (
    id SERIAL PRIMARY KEY,
    developer_id INTEGER NOT NULL REFERENCES developers(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(developer_id, skill_id)
);

-- Updated tasks table with self-referential relationship for subtasks
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'To-do',
    assigned_developer_id INTEGER REFERENCES developers(id) ON DELETE SET NULL,
    parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,  -- NEW: Self-reference for subtasks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('To-do', 'In Progress', 'Done'))
);

-- Create index for better performance on parent_task_id queries
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);

-- junction table (many-to-many)
CREATE TABLE task_skills (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    skill_id INTEGER NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_id, skill_id)
);

-- ============================================================
-- Seed Data
-- ============================================================

INSERT INTO skills (name) VALUES 
    ('Frontend'),
    ('Backend');

INSERT INTO developers (name) VALUES 
    ('Alice'),
    ('Bob'),
    ('Carol'),
    ('Dave');

-- Assign skills to developers
INSERT INTO developer_skills (developer_id, skill_id)
SELECT d.id, s.id
FROM developers d, skills s
WHERE d.name = 'Alice' AND s.name = 'Frontend';

INSERT INTO developer_skills (developer_id, skill_id)
SELECT d.id, s.id
FROM developers d, skills s
WHERE d.name = 'Bob' AND s.name = 'Backend';

INSERT INTO developer_skills (developer_id, skill_id)
SELECT d.id, s.id
FROM developers d, skills s
WHERE d.name = 'Carol' AND s.name IN ('Frontend', 'Backend');

INSERT INTO developer_skills (developer_id, skill_id)
SELECT d.id, s.id
FROM developers d, skills s
WHERE d.name = 'Dave' AND s.name = 'Backend';

-- ============================================================
-- Sample Data with Subtasks (Optional - for testing)
-- ============================================================

-- Main task
INSERT INTO tasks (title, status, parent_task_id) VALUES 
    ('Build E-commerce Platform', 'In Progress', NULL);

-- Subtasks of main task
INSERT INTO tasks (title, status, parent_task_id) 
SELECT 'Design Product Catalog UI', 'Done', id FROM tasks WHERE title = 'Build E-commerce Platform';

INSERT INTO tasks (title, status, parent_task_id) 
SELECT 'Implement Shopping Cart', 'In Progress', id FROM tasks WHERE title = 'Build E-commerce Platform';

INSERT INTO tasks (title, status, parent_task_id) 
SELECT 'Setup Payment Gateway', 'To-do', id FROM tasks WHERE title = 'Build E-commerce Platform';

-- Nested subtask (subtask of 'Implement Shopping Cart')
INSERT INTO tasks (title, status, parent_task_id) 
SELECT 'Add to Cart Functionality', 'Done', id FROM tasks WHERE title = 'Implement Shopping Cart';

INSERT INTO tasks (title, status, parent_task_id) 
SELECT 'Cart Quantity Management', 'In Progress', id FROM tasks WHERE title = 'Implement Shopping Cart';

-- Assign skills to tasks
INSERT INTO task_skills (task_id, skill_id)
SELECT t.id, s.id
FROM tasks t, skills s
WHERE t.title LIKE '%UI%' AND s.name = 'Frontend';

INSERT INTO task_skills (task_id, skill_id)
SELECT t.id, s.id
FROM tasks t, skills s
WHERE t.title LIKE '%Cart%' AND s.name IN ('Frontend', 'Backend');

INSERT INTO task_skills (task_id, skill_id)
SELECT t.id, s.id
FROM tasks t, skills s
WHERE t.title LIKE '%Payment%' AND s.name = 'Backend';
