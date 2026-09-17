export declare enum HabitFrequency {
    DIARIA = "diaria",
    SEMANAL = "semanal",
    PERSONALIZADA = "personalizada"
}
export declare class CreateRoutineHabitDto {
    habit_name: string;
    habit_icon?: string;
    frequency?: HabitFrequency;
    order_index?: number;
}
export declare class CreateRoutineDto {
    name: string;
    description?: string;
    habits?: CreateRoutineHabitDto[];
}
