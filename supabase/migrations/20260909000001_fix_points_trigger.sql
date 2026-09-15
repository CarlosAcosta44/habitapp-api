/*====================================================
  MIGRACIÓN: CORRECCIÓN DE TRIGGER PARA SUMAR PUNTOS
  
  Cambia el trigger original de `BEFORE UPDATE` a 
  `BEFORE INSERT OR UPDATE` y adapta la lógica
  para que asigne los puntos cuando un hábito se
  marca como completado por primera vez en el día.
====================================================*/

-- 1. Eliminar el trigger anterior
DROP TRIGGER IF EXISTS trigger_sumar_puntos ON seguimiento.registro_habitos;

-- 2. Recrear la función adaptando la validación del TG_OP
CREATE OR REPLACE FUNCTION seguimiento.sumar_puntos_habito()
RETURNS TRIGGER AS $$
DECLARE
    puntos_habito INT;
BEGIN
    -- 1. CASO: Hábito Marcado como Completado (ya sea por INSERT o por UPDATE)
    IF (TG_OP = 'INSERT' AND NEW.completado = TRUE) OR 
       (TG_OP = 'UPDATE' AND NEW.completado = TRUE AND (OLD.completado = FALSE OR OLD.completado IS NULL)) THEN
       
        SELECT puntos INTO puntos_habito FROM seguimiento.habitos WHERE idhabito = NEW.idhabito;

        UPDATE gestion.usuarios
        SET puntostotales = puntostotales + puntos_habito
        WHERE idusuario = NEW.idusuario;

        INSERT INTO gestion.historial_puntos (puntos, motivo, idusuario)
        VALUES (
            puntos_habito,
            'Hábito completado: ' || (SELECT nombre FROM seguimiento.habitos WHERE idhabito = NEW.idhabito),
            NEW.idusuario
        );
        NEW.puntos_ganados := puntos_habito;

    -- 2. CASO: Hábito Desmarcado (Revertir progreso, esto solo pasa en UPDATE)
    ELSIF TG_OP = 'UPDATE' AND NEW.completado = FALSE AND OLD.completado = TRUE THEN
        UPDATE gestion.usuarios
        SET puntostotales = puntostotales - OLD.puntos_ganados
        WHERE idusuario = NEW.idusuario;

        INSERT INTO gestion.historial_puntos (puntos, motivo, idusuario)
        VALUES (
            -OLD.puntos_ganados,
            'Deshacer: Hábito ' || (SELECT nombre FROM seguimiento.habitos WHERE idhabito = NEW.idhabito),
            NEW.idusuario
        );
        NEW.puntos_ganados := 0;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Crear el nuevo trigger que actúe en INSERT o UPDATE
CREATE TRIGGER trigger_sumar_puntos
    BEFORE INSERT OR UPDATE ON seguimiento.registro_habitos
    FOR EACH ROW
    EXECUTE FUNCTION seguimiento.sumar_puntos_habito();
