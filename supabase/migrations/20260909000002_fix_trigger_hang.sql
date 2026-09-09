-- 1. Eliminar el trigger anterior
DROP TRIGGER IF EXISTS trigger_sumar_puntos ON seguimiento.registro_habitos;
DROP FUNCTION IF EXISTS seguimiento.sumar_puntos_habito();

-- 2. Crear función para BEFORE INSERT/UPDATE (solo asigna puntos_ganados)
CREATE OR REPLACE FUNCTION seguimiento.asignar_puntos_ganados()
RETURNS TRIGGER AS $$
DECLARE
    p_habito INT;
BEGIN
    IF NEW.completado = TRUE AND (TG_OP = 'INSERT' OR OLD.completado = FALSE OR OLD.completado IS NULL) THEN
        SELECT puntos INTO p_habito FROM seguimiento.habitos WHERE idhabito = NEW.idhabito;
        NEW.puntos_ganados := p_habito;
    ELSIF NEW.completado = FALSE THEN
        NEW.puntos_ganados := 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_asignar_puntos
    BEFORE INSERT OR UPDATE ON seguimiento.registro_habitos
    FOR EACH ROW
    EXECUTE FUNCTION seguimiento.asignar_puntos_ganados();

-- 3. Crear función para AFTER INSERT/UPDATE (aplica los efectos secundarios)
CREATE OR REPLACE FUNCTION seguimiento.aplicar_puntos_usuario()
RETURNS TRIGGER AS $$
DECLARE
    diferencia INT;
    nombre_habito TEXT;
BEGIN
    -- Calcular la diferencia de puntos ganados
    IF TG_OP = 'INSERT' THEN
        diferencia := NEW.puntos_ganados;
    ELSE
        diferencia := NEW.puntos_ganados - COALESCE(OLD.puntos_ganados, 0);
    END IF;

    -- Si hubo un cambio real en los puntos
    IF diferencia <> 0 THEN
        UPDATE gestion.usuarios
        SET puntostotales = puntostotales + diferencia
        WHERE idusuario = NEW.idusuario;

        SELECT nombre INTO nombre_habito FROM seguimiento.habitos WHERE idhabito = NEW.idhabito;

        IF diferencia > 0 THEN
            INSERT INTO gestion.historial_puntos (puntos, motivo, idusuario)
            VALUES (diferencia, 'Hábito completado: ' || COALESCE(nombre_habito, 'Desconocido'), NEW.idusuario);
        ELSE
            INSERT INTO gestion.historial_puntos (puntos, motivo, idusuario)
            VALUES (diferencia, 'Deshacer: Hábito ' || COALESCE(nombre_habito, 'Desconocido'), NEW.idusuario);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_aplicar_puntos
    AFTER INSERT OR UPDATE ON seguimiento.registro_habitos
    FOR EACH ROW
    EXECUTE FUNCTION seguimiento.aplicar_puntos_usuario();
