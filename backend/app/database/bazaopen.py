import sqlite3
import pandas as pd

# Указываем путь к базе данных
db_path = r"C:\Users\Yanpu\Downloads\agora\backend\app\database\scientists.db"

# Подключаемся к базе данных
conn = sqlite3.connect(db_path)

# Получаем список всех таблиц
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

# Настроим pandas на отображение всех столбцов
pd.set_option('display.max_columns', None)

# Для каждой таблицы выводим первые 2 строки
for table in tables:
    table_name = table[0]
    print(f"\nДанные в таблице: {table_name}")
    
    # Загружаем данные из текущей таблицы в DataFrame
    df = pd.read_sql_query(f"SELECT * FROM {table_name};", conn)
    
    # Выводим только первые 2 строки из таблицы
    print(df.head(2))

# Закрываем соединение
conn.close()
