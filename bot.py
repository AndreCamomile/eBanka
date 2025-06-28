#!/usr/bin/env python3
"""
eBanka Telegram Bot
Приклад бота для обробки даних з Telegram Mini App
"""

import logging
import json
from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Налаштування логування
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Ваш токен бота
BOT_TOKEN = "8111877499:AAHFkhqcYCq1kNY6AMK6ma2f4nxS2YiV34k"
# URL вашого веб-апп на Netlify
WEB_APP_URL = "https://earnest-cheesecake-a6eeef.netlify.app/"


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обробник команди /start"""
    user = update.effective_user
    
    # Створюємо кнопку для відкриття веб-апп
    keyboard = [
        [KeyboardButton(
            text="🏦 Open eBanka",
            web_app=WebAppInfo(url=WEB_APP_URL)
        )]
    ]
    reply_markup = ReplyKeyboardMarkup(
        keyboard,
        resize_keyboard=True,
        one_time_keyboard=False
    )
    
    welcome_message = f"""
🏦 Привіт, {user.first_name}!

Ласкаво просимо до eBanka - вашого цифрового банкінгу в Telegram!

Натисніть кнопку нижче, щоб відкрити додаток:
    """
    
    await update.message.reply_text(
        welcome_message,
        reply_markup=reply_markup
    )


async def handle_web_app_data(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обробник даних з веб-апп"""
    try:
        # Отримуємо дані з веб-апп
        web_app_data = update.effective_message.web_app_data.data
        data = json.loads(web_app_data)
        
        user = update.effective_user
        action = data.get('action', 'unknown')
        
        logger.info(f"Received web app data from {user.id}: {data}")
        
        if action == 'search':
            query = data.get('query', '')
            user_info = data.get('user', {})
            
            response = f"""
🔍 Результати пошуку

👤 Користувач: {user.first_name}
🔎 Запит: @{query}

📊 Статус: Знайдено
💰 Баланс: 1,250.00 UAH
📈 Рейтинг: ⭐⭐⭐⭐⭐

Дякуємо за використання eBanka!
            """
            
        elif action == 'donate':
            amount = data.get('amount', 0)
            response = f"""
💖 Донат отримано!

💰 Сума: {amount} UAH
👤 Від: {user.first_name}
✅ Статус: Успішно

Дякуємо за вашу підтримку!
            """
            
        else:
            response = f"📨 Отримано дані: {action}"
        
        await update.message.reply_text(response)
        
    except json.JSONDecodeError:
        await update.message.reply_text("❌ Помилка обробки даних")
    except Exception as e:
        logger.error(f"Error handling web app data: {e}")
        await update.message.reply_text("❌ Виникла помилка")


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Обробник команди /help"""
    help_text = """
🏦 eBanka Bot - Довідка

📱 Команди:
/start - Запустити бота та відкрити веб-апп
/help - Показати цю довідку

🚀 Функції веб-апп:
• Пошук користувачів за нікнеймом
• Перегляд Dashboard
• Система донатів
• Налаштування

💡 Як користуватися:
1. Натисніть кнопку "🏦 Open eBanka"
2. Введіть нікнейм для пошуку
3. Використовуйте меню для навігації

📞 Підтримка: @your_support_username
    """
    
    await update.message.reply_text(help_text)


def main() -> None:
    """Запуск бота"""
    # Створюємо додаток
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Додаємо обробники
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_web_app_data))
    
    # Запускаємо бота
    print("🤖 eBanka Bot запущено...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == '__main__':
    main() 