-- Create life_spheres table for task categorization
CREATE TABLE IF NOT EXISTS life_spheres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default life spheres
INSERT INTO life_spheres (name, icon, color) VALUES
('Домашние дела', 'Home', '#F97316'),
('Работа', 'Briefcase', '#8B5CF6'),
('Личное', 'Heart', '#D946EF');
