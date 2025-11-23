-- Create checklists table
CREATE TABLE IF NOT EXISTS checklists (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sphere_id INTEGER REFERENCES life_spheres(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update tasks table to link with checklists
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS checklist_id INTEGER REFERENCES checklists(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_checklists_sphere_id ON checklists(sphere_id);
CREATE INDEX IF NOT EXISTS idx_tasks_checklist_id ON tasks(checklist_id);
