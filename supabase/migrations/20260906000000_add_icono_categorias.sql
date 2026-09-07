-- 1. Add the column to the table
ALTER TABLE seguimiento.categorias_habitos
ADD COLUMN icono VARCHAR(50);

-- 2. Update existing categories with icons
UPDATE seguimiento.categorias_habitos SET icono = 'water_drop' WHERE nombre = 'Hidratación';
UPDATE seguimiento.categorias_habitos SET icono = 'fitness_center' WHERE nombre = 'Ejercicio';
UPDATE seguimiento.categorias_habitos SET icono = 'self_improvement' WHERE nombre = 'Salud Mental';
UPDATE seguimiento.categorias_habitos SET icono = 'bedtime' WHERE nombre = 'Sueño';
UPDATE seguimiento.categorias_habitos SET icono = 'restaurant' WHERE nombre = 'Nutrición';
UPDATE seguimiento.categorias_habitos SET icono = 'checklist' WHERE nombre = 'Productividad';
