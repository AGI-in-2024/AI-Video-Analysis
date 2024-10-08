# Программа расчёта тягово-скоростных и электроэнергетических характеристик электромобиля

import numpy as np
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import ttk

def safe_float(value, default):
    try:
        return float(value) if value else default
    except ValueError:
        return default

def calculate():
    # Получаем значения из полей ввода или используем значения по умолчанию
    m = safe_float(entry_m.get(), 1600)                 # Масса электромобиля (кг)
    f_roll = safe_float(entry_f_roll.get(), 0.015)      # Коэффициент сопротивления качению
    rho = safe_float(entry_rho.get(), 1.225)            # Плотность воздуха (кг/м³)
    Cd = safe_float(entry_Cd.get(), 0.24)               # Коэффициент лобового сопротивления
    A = safe_float(entry_A.get(), 2.2)                  # Площадь фронтальной поверхности (м²)
    P_max = safe_float(entry_P_max.get(), 100000)       # Максимальная мощность электродвигателя (Вт)
    v_max = safe_float(entry_v_max.get(), 60)           # Максимальная скорость (м/с)
    theta = safe_float(entry_theta.get(), 0)            # Угол уклона дороги (градусы)
    a = safe_float(entry_a.get(), 0)                    # Ускорение (м/с²)
    eta_motor = safe_float(entry_eta_motor.get(), 0.9)  # КПД электродвигателя
    C_batt = safe_float(entry_C_batt.get(), 75)         # Ёмкость батареи (кВт·ч)
    v_min = safe_float(entry_v_min.get(), 0)            # Минимальная скорость (м/с)

    # Перевод угла в радианы
    theta_rad = np.radians(theta)

    # Расчёт диапазона скоростей
    v = np.linspace(max(0.1, v_min), v_max, 100)  # Скорость от v_min до v_max м/с

    # Обновлённый расчёт сил сопротивления
    g = 9.81  # Ускорение свободного падения (м/с²)
    F_roll = m * g * f_roll * np.cos(theta_rad)          # Сила сопротивления качению (Н)
    F_aero = 0.5 * rho * Cd * A * v**2                   # Аэродинамическое сопротивление (Н)
    F_grade = m * g * np.sin(theta_rad)                  # Сила тяжести на уклоне (Н)
    F_inertia = m * a                                    # Инерционная сила (Н)
    F_total = F_roll + F_aero + F_grade + F_inertia      # Суммарная сила сопротивления (Н)

    # Расчёт требуемой мощности на колесе
    P_required = F_total * v                             # Требуемая мощность (Вт)

    # Учёт КПД электродвигателя
    P_input = P_required / eta_motor                     # Требуемая электрическая мощность (Вт)

    # Расчёт энергопотребления
    E_consumption = (P_input / 1000) / v * 3600          # Энергопотребление (кВт·ч на 100 км)

    # Ограничиваем по максимальной мощности двигателя
    P_available = np.full_like(v, P_max)
    P_effective = np.minimum(P_input, P_available)       # Фактическая потребляемая мощность (Вт)

    # Расчёт запаса хода
    Range = (C_batt * 1000) / (P_effective / v)          # Запас хода (м)

    # Построение графиков
    plt.figure(figsize=(12, 8))

    plt.subplot(2, 2, 1)
    plt.plot(v, F_total, label='Суммарное сопротивление')
    plt.xlabel('Скорость (м/с)')
    plt.ylabel('Сила (Н)')
    plt.title('Силы сопротивления')
    plt.legend()
    plt.grid(True)

    plt.subplot(2, 2, 2)
    plt.plot(v, P_required / 1000, label='Требуемая мощность')
    plt.plot(v, P_effective / 1000, label='Фактическая мощность двигателя')
    plt.xlabel('Скорость (м/с)')
    plt.ylabel('Мощность (кВт)')
    plt.title('Мощностные характеристики')
    plt.legend()
    plt.grid(True)

    plt.subplot(2, 2, 3)
    plt.plot(v, E_consumption, label='Энергопотребление')
    plt.xlabel('Скорость (м/с)')
    plt.ylabel('кВт·ч на 100 км')
    plt.title('Энергопотребление в зависимости от скорости')
    plt.legend()
    plt.grid(True)

    plt.subplot(2, 2, 4)
    plt.plot(v, Range / 1000, label='Запас хода')
    plt.xlabel('Скорость (м/с)')
    plt.ylabel('Запас хода (км)')
    plt.title('Запас хода в зависимости от скорости')
    plt.legend()
    plt.grid(True)

    plt.tight_layout()
    plt.show()

# Создаём окно приложения
root = tk.Tk()
root.title("Расчёт характеристик электромобиля")

# Функция для создания поля ввода с меткой и значением по умолчанию
def create_input_field(row, label_text, default_value):
    label = ttk.Label(root, text=label_text)
    label.grid(column=0, row=row, sticky=tk.W, padx=5, pady=5)
    entry = ttk.Entry(root)
    entry.grid(column=1, row=row, padx=5, pady=5)
    entry.insert(0, str(default_value))
    return entry

# Создаем поля ввода с метками и значениями по умолчанию
entry_m = create_input_field(0, "Масса электромобиля (кг):", 1600)
entry_f_roll = create_input_field(1, "Коэффициент сопротивления качению:", 0.015)
entry_rho = create_input_field(2, "Плотность воздуха (кг/м³):", 1.225)
entry_Cd = create_input_field(3, "Коэффициент лобового сопротивления Cd:", 0.24)
entry_A = create_input_field(4, "Площадь фронтальной поверхности (м²):", 2.2)
entry_P_max = create_input_field(5, "Максимальная мощность двигателя (Вт):", 100000)
entry_eta_motor = create_input_field(6, "КПД электродвигателя:", 0.9)
entry_C_batt = create_input_field(7, "Ёмкость батареи (кВт·ч):", 75)
entry_v_min = create_input_field(8, "Минимальная скорость (м/с):", 0)
entry_v_max = create_input_field(9, "Максимальная скорость (м/с):", 60)
entry_theta = create_input_field(10, "Угол уклона дороги (°):", 0)
entry_a = create_input_field(11, "Ускорение (м/с²):", 0)

# Кнопка для запуска расчёта
button_calculate = ttk.Button(root, text="Рассчитать", command=calculate)
button_calculate.grid(column=0, row=12, columnspan=2, pady=10)

root.mainloop()