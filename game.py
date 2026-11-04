"""РП Россия — данные игры: одежда, работы, бизнесы, локации, казино."""

MAX_LEVEL = 100
START_LOCATION = 0
START_BALANCE = 1000

LOCATIONS = [
    {"id":0,"name":"Мухосранск","emoji":"🏚","desc":"Спальный район. Гопники и работяги."},
    {"id":1,"name":"Черёмушки","emoji":"🏢","desc":"Офисный центр. Айтишники и менеджеры."},
    {"id":2,"name":"Барвиха","emoji":"🏰","desc":"Элитный посёлок. Олигархи и блогеры."},
]

SLOTS = ["head_id","body_id","legs_id","right_hand_id","left_hand_id"]
SLOT_NAMES = {
    "head_id":"Голова","body_id":"Тело","legs_id":"Ноги",
    "right_hand_id":"Правая рука","left_hand_id":"Левая рука",
}
SLOT_DEFAULT_EMOJI = {
    "head_id":"😀","body_id":"🧍","legs_id":"🦵",
    "right_hand_id":"✋","left_hand_id":"✋",
}
SLOT_CATEGORY = {
    "head_id":"head","body_id":"body","legs_id":"legs",
    "right_hand_id":"right_hand","left_hand_id":"left_hand",
}
CATEGORY_NAMES = {"head":"Голова","body":"Тело","legs":"Ноги",
                  "right_hand":"Правая рука","left_hand":"Левая рука"}
CATEGORY_EMOJI = {"head":"🧢","body":"👕","legs":"👖",
                  "right_hand":"🤚","left_hand":"🖐"}
SLOT_BY_CATEGORY = {v:k for k,v in SLOT_CATEGORY.items()}

RARITIES = {
    "common":{"name":"Обычный","color":"#9aa0a6"},
    "uncommon":{"name":"Необычный","color":"#5fbb5f"},
    "rare":{"name":"Редкий","color":"#3d8de0"},
    "epic":{"name":"Эпический","color":"#a155cf"},
    "legendary":{"name":"Легендарный","color":"#f0a500"},
}

ITEMS = {
    # ГОЛОВА
    "h_cig":{"name":"Сига в зубы","emoji":"🚬","slot":"head","price":100,"rarity":"common","desc":"Всё похуй"},
    "h_cap":{"name":"Кепка 'Сосать'","emoji":"🧢","slot":"head","price":300,"rarity":"common","desc":"Дерзкая классика"},
    "h_ushanka":{"name":"Шапка-ушанка","emoji":"🧢","slot":"head","price":500,"rarity":"common","desc":"Русский стиль"},
    "h_balaclava":{"name":"Балаклава","emoji":"🥷","slot":"head","price":800,"rarity":"uncommon","desc":"Гоп-стоп"},
    "h_rooster":{"name":"Маска петушары","emoji":"🐔","slot":"head","price":1000,"rarity":"uncommon","desc":"Петух в законе"},
    "h_bandana":{"name":"Бандана","emoji":"🧣","slot":"head","price":1200,"rarity":"uncommon","desc":"Уличный стиль"},
    "h_wig":{"name":"Парик деда","emoji":"👴","slot":"head","price":1500,"rarity":"uncommon","desc":"70 лет стажа"},
    "h_crown":{"name":"Корона","emoji":"👑","slot":"head","price":5000,"rarity":"rare","desc":"Я король"},
    "h_guy":{"name":"Маска Гая Фокса","emoji":"🎭","slot":"head","price":8000,"rarity":"rare","desc":"Анонимус"},
    "h_horns":{"name":"Рога дьявола","emoji":"😈","slot":"head","price":15000,"rarity":"epic","desc":"Демонический вайб"},
    "h_moto":{"name":"Шлем мотоциклиста","emoji":"🪖","slot":"head","price":20000,"rarity":"epic","desc":"Скорость и опасность"},
    "h_gold_crown":{"name":"Золотая корона","emoji":"👑","slot":"head","price":100000,"rarity":"legendary","desc":"Император"},
    # ТЕЛО
    "b_alco":{"name":"Майка-алкоголичка","emoji":"👕","slot":"body","price":200,"rarity":"common","desc":"Классика жанра"},
    "b_aura":{"name":"Футболка 'АУРА ФАРМИНГ'","emoji":"👕","slot":"body","price":500,"rarity":"common","desc":"+100 к ауре"},
    "b_iambog":{"name":"Футболка 'Я БОГ'","emoji":"👕","slot":"body","price":800,"rarity":"common","desc":"Скромно"},
    "b_cage":{"name":"Рубашка в клетку","emoji":"👔","slot":"body","price":1000,"rarity":"uncommon","desc":"Настоящий мужик"},
    "b_supreme":{"name":"Худи Supreme (фейк)","emoji":"🧥","slot":"body","price":1500,"rarity":"uncommon","desc":"С рынка"},
    "b_armani":{"name":"Пиджак Armani (фейк)","emoji":"🧥","slot":"body","price":3000,"rarity":"uncommon","desc":"Понтово"},
    "b_nf":{"name":"Пуховик North Face","emoji":"🧥","slot":"body","price":5000,"rarity":"rare","desc":"Зимой тепло"},
    "b_leather":{"name":"Кожаная куртка","emoji":"🧥","slot":"body","price":8000,"rarity":"rare","desc":"Байкерский"},
    "b_wedding":{"name":"Свадебное платье","emoji":"👰","slot":"body","price":15000,"rarity":"epic","desc":"Выходи за меня"},
    "b_vest":{"name":"Бронежилет","emoji":"🦺","slot":"body","price":25000,"rarity":"epic","desc":"Пуленепробиваемый"},
    "b_tuxedo":{"name":"Смокинг","emoji":"🤵","slot":"body","price":50000,"rarity":"epic","desc":"Джеймс Бонд"},
    "b_santa":{"name":"Костюм Санты","emoji":"🎅","slot":"body","price":80000,"rarity":"legendary","desc":"Хо-хо-хо"},
    # НОГИ
    "l_family":{"name":"Семейные трусы","emoji":"🩲","slot":"legs","price":100,"rarity":"common","desc":"Уютно"},
    "l_adidas":{"name":"Треники Adidas","emoji":"👖","slot":"legs","price":400,"rarity":"common","desc":"3 полоски"},
    "l_ripped":{"name":"Джинсы с дырками","emoji":"👖","slot":"legs","price":800,"rarity":"common","desc":"Модно"},
    "l_shorts":{"name":"Пляжные шорты","emoji":"🩳","slot":"legs","price":1000,"rarity":"uncommon","desc":"На море"},
    "l_levis":{"name":"Джинсы Levis (фейк)","emoji":"👖","slot":"legs","price":2000,"rarity":"uncommon","desc":"С савёловского"},
    "l_lampasy":{"name":"Спортивки с лампасами","emoji":"👖","slot":"legs","price":3000,"rarity":"uncommon","desc":"Спортивный стиль"},
    "l_camo":{"name":"Штаны камуфляж","emoji":"👖","slot":"legs","price":5000,"rarity":"rare","desc":"Военный"},
    "l_classic":{"name":"Классические брюки","emoji":"👖","slot":"legs","price":10000,"rarity":"rare","desc":"Офисный"},
    "l_leather":{"name":"Кожаные штаны рокера","emoji":"👖","slot":"legs","price":20000,"rarity":"epic","desc":"Рок-н-ролл"},
    "l_gold":{"name":"Штаны из чистого золота","emoji":"👖","slot":"legs","price":100000,"rarity":"legendary","desc":"Золотой унитаз"},
    # ПРАВАЯ РУКА
    "rh_cig":{"name":"Сигарета","emoji":"🚬","slot":"right_hand","price":50,"rarity":"common","desc":"Затянись"},
    "rh_beer":{"name":"Бутылка пива","emoji":"🍺","slot":"right_hand","price":100,"rarity":"common","desc":"Жигулёвское"},
    "rh_baltica":{"name":"Балтика 9","emoji":"🍺","slot":"right_hand","price":200,"rarity":"common","desc":"Крепкое"},
    "rh_shaverma":{"name":"Шаурма","emoji":"🌯","slot":"right_hand","price":300,"rarity":"common","desc":"Со свининой"},
    "rh_rose":{"name":"Роза","emoji":"🌹","slot":"right_hand","price":500,"rarity":"uncommon","desc":"Для дам"},
    "rh_rod":{"name":"Удочка","emoji":"🎣","slot":"right_hand","price":1000,"rarity":"uncommon","desc":"На рыбалку"},
    "rh_bat":{"name":"Бита","emoji":"🏏","slot":"right_hand","price":3000,"rarity":"uncommon","desc":"Разборки"},
    "rh_nerf":{"name":"Пистолет (нерф)","emoji":"🔫","slot":"right_hand","price":5000,"rarity":"rare","desc":"Понты"},
    "rh_flag_rus":{"name":"Флаг России","emoji":"🇷🇺","slot":"right_hand","price":8000,"rarity":"rare","desc":"Патриот"},
    "rh_case":{"name":"Чемодан с деньгами","emoji":"💼","slot":"right_hand","price":50000,"rarity":"epic","desc":"Олигарх"},
    # ЛЕВАЯ РУКА
    "lh_phone":{"name":"Телефон","emoji":"📱","slot":"left_hand","price":200,"rarity":"common","desc":"Нокиа"},
    "lh_wallet":{"name":"Кошелёк","emoji":"👛","slot":"left_hand","price":500,"rarity":"common","desc":"С двумя рублями"},
    "lh_cola":{"name":"Кола","emoji":"🥤","slot":"left_hand","price":300,"rarity":"common","desc":"Освежает"},
    "lh_ext":{"name":"Огнетушитель","emoji":"🧯","slot":"left_hand","price":1500,"rarity":"uncommon","desc":"На всякий"},
    "lh_guitar":{"name":"Гитара","emoji":"🎸","slot":"left_hand","price":3000,"rarity":"uncommon","desc":"Дворовый музыкант"},
    "lh_shield":{"name":"Щит","emoji":"🛡","slot":"left_hand","price":5000,"rarity":"rare","desc":"Оборона"},
    "lh_sword":{"name":"Меч","emoji":"⚔","slot":"left_hand","price":10000,"rarity":"rare","desc":"Рыцарь"},
    "lh_flag_ussr":{"name":"Флаг СССР","emoji":"🚩","slot":"left_hand","price":8000,"rarity":"rare","desc":"Ностальгия"},
    "lh_briefcase":{"name":"Кейс с кокаином","emoji":"❄","slot":"left_hand","price":30000,"rarity":"epic","desc":"Не спрашивай"},
    "lh_cat":{"name":"Кот-талисман","emoji":"🐱","slot":"left_hand","price":100000,"rarity":"legendary","desc":"Приносит удачу"},
}

JOBS = {
    "courier":{"name":"Курьер","emoji":"🚴","salary":100,"xp":5,"cooldown":60,"level":1,"desc":"Развози еду"},
    "loader":{"name":"Грузчик","emoji":"📦","salary":250,"xp":10,"cooldown":120,"level":3,"desc":"Таскай коробки"},
    "taxi":{"name":"Таксист","emoji":"🚕","salary":500,"xp":20,"cooldown":180,"level":5,"desc":"Кати пассажиров"},
    "programmer":{"name":"Программист","emoji":"💻","salary":1200,"xp":40,"cooldown":240,"level":10,"desc":"Фикси баги"},
    "blogger":{"name":"Блогер","emoji":"📹","salary":3000,"xp":80,"cooldown":300,"level":15,"desc":"Стримь на аудиторию"},
}

BUSINESSES = {
    "shawarma":{"name":"Шаурмечная Ашота","emoji":"🌯","price":5000,"income":100,"xp":50,"desc":"Самая сочная шаурма в городе"},
    "drones":{"name":"Завод дронов","emoji":"🛸","price":25000,"income":300,"xp":100,"desc":"Производим беспилотники"},
    "pelmeni":{"name":"Пельменная","emoji":"🥟","price":50000,"income":600,"xp":150,"desc":"Пельмени как у бабушки"},
    "crypto_farm":{"name":"Крипто-ферма","emoji":"⛏","price":100000,"income":1500,"xp":250,"desc":"Майним битки"},
    "beauty":{"name":"Салон 'Барби'","emoji":"💅","price":250000,"income":3000,"xp":400,"desc":"Красота — страшная сила"},
    "pawnshop":{"name":"Ломбард 'Золотой'","emoji":"💰","price":500000,"income":6000,"xp":600,"desc":"Скупаем всё"},
    "restaurant":{"name":"Ресторан 'Пушкин'","emoji":"🍽","price":1000000,"income":12000,"xp":1000,"desc":"Дорого-богато"},
    "bentley":{"name":"Завод Бентли","emoji":"🚗","price":2500000,"income":25000,"xp":1500,"desc":"Роскошные тачки"},
    "oil":{"name":"Нефтяная вышка","emoji":"🛢","price":5000000,"income":50000,"xp":2500,"desc":"Чёрное золото"},
    "gazprom":{"name":"Газпром","emoji":"🏭","price":10000000,"income":100000,"xp":5000,"desc":"Национальное достояние"},
}

CASINO_GAMES = {
    "coin":{"name":"Монетка","emoji":"🪙","desc":"Орёл/решка — x2","chance":0.5,"payout":2.0},
    "dice":{"name":"Кости","emoji":"🎲","desc":"Больше 3 — x1.8","chance":0.5,"payout":1.8},
    "red":{"name":"Рулетка: красное","emoji":"🔴","desc":"Красное — x2","chance":18/37,"payout":2.0},
    "black":{"name":"Рулетка: чёрное","emoji":"⚫","desc":"Чёрное — x2","chance":18/37,"payout":2.0},
    "zero":{"name":"Рулетка: зеро","emoji":"🟢","desc":"Зеро — x35","chance":1/37,"payout":35.0},
    "jackpot":{"name":"Джекпот","emoji":"💎","desc":"8% шанс — x10","chance":0.08,"payout":10.0},
    "slots":{"name":"Слоты","emoji":"🎰","desc":"3 в ряд — x5, 2 — x1.5","chance":None,"payout":None},
}

ACHIEVEMENTS = {
    "first_job":{"name":"Работяга","emoji":"💼","desc":"Выполни первую работу"},
    "first_business":{"name":"Бизнесмен","emoji":"💼","desc":"Купи первый бизнес"},
    "millionaire":{"name":"Миллионер","emoji":"💰","desc":"Накопи 1 000 000₽"},
    "billionaire":{"name":"Миллиардер","emoji":"💎","desc":"Накопи 1 000 000 000₽"},
    "gambler":{"name":"Азартный","emoji":"🎲","desc":"Сыграй 10 раз в казино"},
    "big_winner":{"name":"Джекпот","emoji":"🎰","desc":"Выиграй 100 000₽ за раз"},
    "criminal":{"name":"Авторитет","emoji":"🕶","desc":"Успешно укради 5 раз"},
    "in_debt":{"name":"Должник","emoji":"💸","desc":"Возьми кредит"},
    "fashion":{"name":"Модник","emoji":"👔","desc":"Собери 5 разных одежд"},
    "level10":{"name":"Опытный","emoji":"⭐","desc":"Достигни 10 уровня"},
    "rich_king":{"name":"Император","emoji":"👑","desc":"Купи золотую корону"},
    "trader":{"name":"Барыга","emoji":"🤝","desc":"Заверши трейд"},
}

DAILY_REWARDS = [500,1000,2000,3000,5000,7000,10000]

def xp_to_next(level):
    return 100 + (level - 1) * 50

def total_xp_for_level(level):
    return sum(xp_to_next(i) for i in range(1, level))

def crypto_price():
    """Цена коина меняется каждый час."""
    import time, hashlib
    hour = int(time.time() / 3600)
    h = hashlib.md5(f"coin_{hour}".encode()).hexdigest()
    return 500 + (int(h[:4], 16) % 1000)

def item_json(iid):
    it = ITEMS.get(iid)
    if not it: return None
    return {"item_id":iid,"name":it["name"],"emoji":it["emoji"],
            "slot":it["slot"],"price":it["price"],"rarity":it["rarity"],
            "rarity_name":RARITIES[it["rarity"]]["name"],
            "rarity_color":RARITIES[it["rarity"]]["color"],
            "desc":it["desc"]}

def item_sell_price(iid):
    return max(1, int(ITEMS.get(iid, {}).get("price", 10) * 0.5))

def get_outfit(player):
    """Возвращает словарь slot -> {item_id, emoji, name} или None."""
    outfit = {}
    for slot in SLOTS:
        iid = player.get(slot)
        if iid and iid in ITEMS:
            outfit[slot] = {"item_id":iid, "emoji":ITEMS[iid]["emoji"],
                            "name":ITEMS[iid]["name"]}
        else:
            outfit[slot] = {"item_id":None, "emoji":SLOT_DEFAULT_EMOJI[slot], "name":None}
    return outfit

# ═══════ ДОПОЛНИТЕЛЬНЫЕ ПРЕДМЕТЫ (+10 на слот) ═══════
ITEMS.update({
    # ГОЛОВА +10
    "h_cheburashka": {"name":"Шапка Чебурашки","emoji":"🐻","slot":"head","price":400,"rarity":"common","desc":"Огромные уши"},
    "h_bandit": {"name":"Бандитская маска","emoji":"🥷","slot":"head","price":900,"rarity":"uncommon","desc":"Никто не узнает"},
    "h_pirate": {"name":"Пиратская бандана","emoji":"🏴‍☠️","slot":"head","price":1500,"rarity":"uncommon","desc":"Йо-хо-хо"},
    "h_fedora": {"name":"Федора","emoji":"🎩","slot":"head","price":2500,"rarity":"uncommon","desc":"Стильный детектив"},
    "h_beret": {"name":"Берет","emoji":"🎨","slot":"head","price":3500,"rarity":"rare","desc":"Французский шарм"},
    "h_vr": {"name":"VR шлем","emoji":"🥽","slot":"head","price":12000,"rarity":"rare","desc":"Виртуальная реальность"},
    "h_halo": {"name":"Нимб","emoji":"😇","slot":"head","price":25000,"rarity":"epic","desc":"Святой"},
    "h_cap_red": {"name":"Красная кепка","emoji":"🧢","slot":"head","price":6000,"rarity":"rare","desc":"Классика гопника"},
    "h_flower": {"name":"Цветок в волосах","emoji":"🌸","slot":"head","price":8000,"rarity":"rare","desc":"Романтика"},
    "h_mask_money": {"name":"Маска с $","emoji":"💵","slot":"head","price":30000,"rarity":"epic","desc":"Денежный"},
    # ТЕЛО +10
    "b_tank_usa": {"name":"Майка USA","emoji":"🇺🇸","slot":"body","price":600,"rarity":"common","desc":"Америка"},
    "b_hoodie": {"name":"Черное худи","emoji":"🧥","slot":"body","price":1200,"rarity":"uncommon","desc":"Гоп-стиль"},
    "b_hawaii": {"name":"Гавайка","emoji":"🌴","slot":"body","price":1800,"rarity":"uncommon","desc":"Отпуск"},
    "b_armor": {"name":"Рыцарский доспех","emoji":"🏰","slot":"body","price":4000,"rarity":"rare","desc":"Защита 100%"},
    "b_bomber": {"name":"Бомбер","emoji":"🧥","slot":"body","price":6000,"rarity":"rare","desc":"Скинхед"},
    "b_poncho": {"name":"Пончо","emoji":"🦙","slot":"body","price":10000,"rarity":"rare","desc":"Мексика"},
    "b_kimono": {"name":"Кимоно","emoji":"🌸","slot":"body","price":18000,"rarity":"epic","desc":"Самурай"},
    "b_jersey": {"name":"Спортивная майка","emoji":"⚽","slot":"body","price":22000,"rarity":"epic","desc":"Спортсмен"},
    "b_dress_red": {"name":"Красное платье","emoji":"👗","slot":"body","price":35000,"rarity":"epic","desc":"Шикарно"},
    "b_shirt_tie": {"name":"Рубашка с галстуком","emoji":"👔","slot":"body","price":70000,"rarity":"legendary","desc":"Бизнесмен"},
    # НОГИ +10
    "l_joggers": {"name":"Джоггеры","emoji":"👖","slot":"legs","price":500,"rarity":"common","desc":"Спортивные"},
    "l_chinos": {"name":"Чиносы","emoji":"👖","slot":"legs","price":1000,"rarity":"uncommon","desc":"Универсальные"},
    "l_skinny": {"name":"Скинни","emoji":"👖","slot":"legs","price":1500,"rarity":"uncommon","desc":"Узкие"},
    "l_baggy": {"name":"Мешки","emoji":"👖","slot":"legs","price":2500,"rarity":"uncommon","desc":"Широкие"},
    "l_overalls": {"name":"Комбинезон","emoji":"👖","slot":"legs","price":5000,"rarity":"rare","desc":"Рабочий"},
    "l_kilt": {"name":"Килт","emoji":"🏴","slot":"legs","price":8000,"rarity":"rare","desc":"Шотландец"},
    "l_harem": {"name":"Шаровары","emoji":"👖","slot":"legs","price":12000,"rarity":"rare","desc":"Восток"},
    "l_track": {"name":"Спортивки","emoji":"👖","slot":"legs","price":18000,"rarity":"epic","desc":"Адидас"},
    "l_cargo": {"name":"Карго","emoji":"👖","slot":"legs","price":28000,"rarity":"epic","desc":"Тактичные"},
    "l_chains": {"name":"Штаны с цепями","emoji":"⛓️","slot":"legs","price":75000,"rarity":"legendary","desc":"Панк"},
    # ПРАВАЯ РУКА +10
    "rh_knife": {"name":"Нож","emoji":"🔪","slot":"right_hand","price":200,"rarity":"common","desc":"Острый"},
    "rh_book": {"name":"Книга","emoji":"📕","slot":"right_hand","price":400,"rarity":"common","desc":"Умный"},
    "rh_donut": {"name":"Пончик","emoji":"🍩","slot":"right_hand","price":300,"rarity":"common","desc":"Вкусный"},
    "rh_icecream": {"name":"Мороженое","emoji":"🍦","slot":"right_hand","price":500,"rarity":"common","desc":"Освежает"},
    "rh_glove": {"name":"Боксерская перчатка","emoji":"🥊","slot":"right_hand","price":1200,"rarity":"uncommon","desc":"Майк Тайсон"},
    "rh_bag": {"name":"Пакет с продуктами","emoji":"🛍️","slot":"right_hand","price":800,"rarity":"uncommon","desc":"Из Пятерочки"},
    "rh_brass": {"name":"Кастет","emoji":"👊","slot":"right_hand","price":2500,"rarity":"uncommon","desc":"Уличный бой"},
    "rh_watermelon": {"name":"Арбуз","emoji":"🍉","slot":"right_hand","price":4000,"rarity":"rare","desc":"Сладкий"},
    "rh_fish": {"name":"Рыба","emoji":"🐟","slot":"right_hand","price":6000,"rarity":"rare","desc":"Свежая"},
    "rh_burger": {"name":"Бургер","emoji":"🍔","slot":"right_hand","price":20000,"rarity":"epic","desc":"Биг-мак"},
    # ЛЕВАЯ РУКА +10
    "lh_coffee": {"name":"Кофе","emoji":"☕","slot":"left_hand","price":150,"rarity":"common","desc":"Бодрит"},
    "lh_hammer": {"name":"Молоток","emoji":"🔨","slot":"left_hand","price":600,"rarity":"common","desc":"Рабочий"},
    "lh_book2": {"name":"Большая книга","emoji":"📚","slot":"left_hand","price":1000,"rarity":"uncommon","desc":"Учёный"},
    "lh_ball": {"name":"Мяч","emoji":"⚽","slot":"left_hand","price":1500,"rarity":"uncommon","desc":"Футбол"},
    "lh_umbrella": {"name":"Зонт","emoji":"☂️","slot":"left_hand","price":3000,"rarity":"uncommon","desc":"На случай дождя"},
    "lh_laptop": {"name":"Ноутбук","emoji":"💻","slot":"left_hand","price":12000,"rarity":"rare","desc":"Работать"},
    "lh_champagne": {"name":"Шампанское","emoji":"🍾","slot":"left_hand","price":18000,"rarity":"epic","desc":"Праздник"},
    "lh_sushi": {"name":"Суши","emoji":"🍣","slot":"left_hand","price":25000,"rarity":"epic","desc":"Японская кухня"},
    "lh_pizza": {"name":"Пицца","emoji":"🍕","slot":"left_hand","price":15000,"rarity":"epic","desc":"Итальянская"},
    "lh_teddy": {"name":"Мишка","emoji":"🧸","slot":"left_hand","price":80000,"rarity":"legendary","desc":"Милый"},
})
print("✅ Загружено предметов:", len(ITEMS))

# ═══════ КРЕДИТ ═══════
CREDIT_MAX = 15000
CREDIT_TERMS = [
    {"hours": 1,  "pct": 5,  "label": "1 час"},
    {"hours": 3,  "pct": 8,  "label": "3 часа"},
    {"hours": 6,  "pct": 12, "label": "6 часов"},
    {"hours": 12, "pct": 18, "label": "12 часов"},
    {"hours": 24, "pct": 25, "label": "1 день"},
    {"hours": 48, "pct": 35, "label": "2 дня"},
]
