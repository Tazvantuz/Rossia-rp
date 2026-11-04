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
    "coin":     {"name":"Монетка","emoji":"🪙","desc":"Орёл/решка — x2","chance":0.5,"payout":2.0},
    "dice":     {"name":"Кости","emoji":"🎲","desc":"Больше 3 — x1.8","chance":0.5,"payout":1.8},
    "roulette": {"name":"Рулетка","emoji":"🎡","desc":"36 чисел + зеро","chance":None,"payout":None},
    "slots":    {"name":"Автомат","emoji":"🎰","desc":"3 в ряд — x5, 3 💎 — x50","chance":None,"payout":None},
}

ROULETTE_NUMBERS = list(range(37))  # 0-36
ROULETTE_RED = {1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36}

def roulette_color(n):
    if n == 0: return "green"
    return "red" if n in ROULETTE_RED else "black"


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
            "desc":it["desc"],"hp":it.get("hp",0),"damage":it.get("damage",0)}

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

# ═══════ БИЗНЕС ВКУСНО И ТОЧКА ═══════
BUSINESSES["vtope"] = {"name":"Вкусно и Точка","emoji":"🍔","price":500000,"income":6000,"xp":700,"desc":"Макдональдс по-русски"}

# ═══════ HP НА ОДЕЖДУ ═══════
BODY_HP = {
  "b_alco":10,"b_aura":15,"b_iambog":20,"b_cage":25,"b_supreme":30,
  "b_armani":35,"b_nf":50,"b_leather":60,"b_wedding":80,"b_vest":150,
  "b_tuxedo":120,"b_santa":200,"b_tank_usa":12,"b_hoodie":22,"b_hawaii":18,
  "b_armor":250,"b_bomber":70,"b_poncho":90,"b_kimono":110,"b_jersey":100,
  "b_dress_red":130,"b_shirt_tie":300,
}
for iid, hp in BODY_HP.items():
    if iid in ITEMS: ITEMS[iid]["hp"] = hp

# ═══════ УРОН НА РУКИ ═══════
HAND_DAMAGE = {
  "rh_cig":1,"rh_beer":3,"rh_baltica":4,"rh_shaverma":2,"rh_rose":1,"rh_rod":5,
  "rh_bat":15,"rh_nerf":8,"rh_flag_rus":6,"rh_case":12,"rh_knife":12,"rh_book":5,
  "rh_donut":1,"rh_icecream":1,"rh_glove":18,"rh_bag":6,"rh_brass":20,
  "rh_watermelon":8,"rh_fish":4,"rh_burger":2,
  "lh_phone":3,"lh_wallet":2,"lh_cola":2,"lh_ext":14,"lh_guitar":10,"lh_shield":8,
  "lh_sword":25,"lh_flag_ussr":5,"lh_briefcase":15,"lh_cat":3,"lh_coffee":2,
  "lh_hammer":18,"lh_book2":4,"lh_ball":3,"lh_umbrella":6,"lh_laptop":10,
  "lh_champagne":7,"lh_sushi":2,"lh_pizza":2,"lh_teddy":1,
}
for iid, dmg in HAND_DAMAGE.items():
    if iid in ITEMS: ITEMS[iid]["damage"] = dmg

# ═══════ HP НА ГОЛОВУ ═══════
HEAD_HP = {
    "h_cig":5,"h_cap":8,"h_ushanka":10,"h_balaclava":15,"h_rooster":18,
    "h_bandana":20,"h_wig":22,"h_crown":35,"h_guy":45,"h_horns":70,
    "h_moto":90,"h_gold_crown":180,
    "h_cheburashka":8,"h_bandit":16,"h_pirate":22,"h_fedora":28,"h_beret":32,
    "h_vr":55,"h_halo":95,"h_cap_red":40,"h_flower":45,"h_mask_money":100,
}
for iid, hp in HEAD_HP.items():
    if iid in ITEMS: ITEMS[iid]["hp"] = hp

# ═══════ HP НА НОГИ ═══════
LEGS_HP = {
    "l_family":5,"l_adidas":8,"l_ripped":12,"l_shorts":15,"l_levis":20,
    "l_lampasy":25,"l_camo":35,"l_classic":50,"l_leather":80,"l_gold":180,
    "l_joggers":10,"l_chinos":15,"l_skinny":18,"l_baggy":22,"l_overalls":32,
    "l_kilt":42,"l_harem":55,"l_track":72,"l_cargo":100,"l_chains":160,
}
for iid, hp in LEGS_HP.items():
    if iid in ITEMS: ITEMS[iid]["hp"] = hp


# ═══════ УНИКАЛЬНЫЕ ПРЕДМЕТЫ ИЗ КЕЙСОВ (15, только кейсы) ═══════
CASE_ITEMS = {
    # Basic кейс (5)
    "h_case_bandit":   {"name":"Бандитская шапка","emoji":"🧢","slot":"head","price":1500,"rarity":"uncommon","desc":"Только из кейса","hp":15},
    "b_case_tracksuit":{"name":"Спортивка Adidas (оригинал)","emoji":"👕","slot":"body","price":3000,"rarity":"uncommon","desc":"Только из кейса","hp":40},
    "l_case_adidas":   {"name":"Треники Adidas (оригинал)","emoji":"👖","slot":"legs","price":2500,"rarity":"uncommon","desc":"Только из кейса","hp":30},
    "rh_case_knife":   {"name":"Выкидной нож","emoji":"🔪","slot":"right_hand","price":3500,"rarity":"rare","desc":"Только из кейса","damage":22},
    "b_case_chains":   {"name":"Футболка с цепями","emoji":"👕","slot":"body","price":4000,"rarity":"rare","desc":"Только из кейса","hp":60},
    # Rare кейс (5)
    "h_case_rooster":  {"name":"Золотая маска петуха","emoji":"🐔","slot":"head","price":15000,"rarity":"epic","desc":"Только из кейса","hp":50},
    "h_case_crypto":   {"name":"Маска биткоина","emoji":"₿","slot":"head","price":20000,"rarity":"epic","desc":"Только из кейса","hp":45},
    "b_case_armani_real":{"name":"Пиджак Armani (оригинал)","emoji":"🤵","slot":"body","price":25000,"rarity":"epic","desc":"Только из кейса","hp":120},
    "rh_case_uzi_gold":{"name":"Золотой УЗИ","emoji":"🔫","slot":"right_hand","price":30000,"rarity":"epic","desc":"Только из кейса","damage":70},
    "l_case_gold_shorts":{"name":"Золотые шорты","emoji":"🩳","slot":"legs","price":22000,"rarity":"epic","desc":"Только из кейса","hp":80},
    # Legendary кейс (5)
    "h_case_helmet_alpha":{"name":"Шлем Альфа","emoji":"🪖","slot":"head","price":80000,"rarity":"legendary","desc":"Только из кейса","hp":200},
    "lh_case_brilliant":{"name":"Бриллиантовый кейс","emoji":"💼","slot":"left_hand","price":100000,"rarity":"legendary","desc":"Только из кейса","damage":80},
    "h_case_dragon":   {"name":"Шлем дракона","emoji":"🐲","slot":"head","price":150000,"rarity":"legendary","desc":"Только из кейса","hp":250},
    "b_case_dragon_armor":{"name":"Доспех дракона","emoji":"🛡","slot":"body","price":200000,"rarity":"legendary","desc":"Только из кейса","hp":300},
    "rh_case_dragon_sword":{"name":"Меч дракона","emoji":"⚔","slot":"right_hand","price":250000,"rarity":"legendary","desc":"Только из кейса","damage":150},
}
ITEMS.update(CASE_ITEMS)

# ═══════ КЕЙСЫ (ТОЛЬКО УНИКАЛЬНЫЕ ПРЕДМЕТЫ) ═══════
CASES = {
  "basic": {"name":"Кейс новичка","emoji":"📦","price":1000,
    "items":[
      {"iid":"h_case_bandit","chance":35},
      {"iid":"b_case_tracksuit","chance":25},
      {"iid":"l_case_adidas","chance":20},
      {"iid":"rh_case_knife","chance":15},
      {"iid":"b_case_chains","chance":5},
    ]},
  "rare": {"name":"Кейс гопника","emoji":"🎁","price":5000,
    "items":[
      {"iid":"h_case_rooster","chance":35},
      {"iid":"h_case_crypto","chance":25},
      {"iid":"b_case_armani_real","chance":20},
      {"iid":"rh_case_uzi_gold","chance":15},
      {"iid":"l_case_gold_shorts","chance":5},
    ]},
  "legendary": {"name":"Кейс олигарха","emoji":"💎","price":25000,
    "items":[
      {"iid":"h_case_helmet_alpha","chance":40},
      {"iid":"lh_case_brilliant","chance":25},
      {"iid":"h_case_dragon","chance":20},
      {"iid":"b_case_dragon_armor","chance":10},
      {"iid":"rh_case_dragon_sword","chance":5},
    ]},
}

# ═══════ БАНДЫ ═══════
GANG_MAX_MEMBERS = 10
GANG_CREATE_COST = 50000
GANG_TERRITORIES = [
  {"id":0,"name":"Гаражи","emoji":"🏚","income":1000,"x":1,"y":1},
  {"id":1,"name":"Ларёк у метро","emoji":"🏪","income":1000,"x":2,"y":1},
  {"id":2,"name":"Промзона","emoji":"🏭","income":1000,"x":3,"y":1},
  {"id":3,"name":"Спальный район","emoji":"🏢","income":1000,"x":1,"y":2},
  {"id":4,"name":"Рынок","emoji":"🛒","income":1000,"x":2,"y":2},
  {"id":5,"name":"Клуб Ночка","emoji":"🎭","income":1000,"x":3,"y":2},
  {"id":6,"name":"Порт","emoji":"⚓","income":1000,"x":1,"y":3},
  {"id":7,"name":"Центр города","emoji":"🏛","income":1000,"x":2,"y":3},
  {"id":8,"name":"Элитный квартал","emoji":"🏰","income":1000,"x":3,"y":3},
]
CAPTURE_HOURS = 1

# ═══════ PVP ═══════
PVP_PARTS = ["head","torso","legs"]
PVP_PARTS_NAMES = {"head":"Голова","torso":"Торс","legs":"Ноги"}
PVP_BASE_HP = 100

def get_combat_stats(player):
    """HP и урон с учётом одежды."""
    hp = PVP_BASE_HP
    dmg = 5
    for slot in ("weapon_id","armor_id","shield_id","head_id","body_id","legs_id","right_hand_id","left_hand_id"):
        iid = player.get(slot)
        if iid and iid in ITEMS:
            hp += ITEMS[iid].get("hp", 0)
            dmg += ITEMS[iid].get("damage", 0)
    return {"hp": hp, "damage": dmg}

# ═══════════════════════════════════════════════════════════════
# БАЛАНСИРОВКА СТАТОВ (BALANCE_APPLIED)
# Линейное распределение стат внутри (редкость, слот) по цене.
# Кейсовые предметы (h_case_*, ...) не трогаются.
# ═══════════════════════════════════════════════════════════════
_CASE_PREFIXES = ("h_case_", "b_case_", "l_case_", "rh_case_", "lh_case_")

_RANGES = {
    ("common", "head"):   (5, 12),
    ("common", "body"):   (5, 15),
    ("common", "legs"):   (5, 12),
    ("common", "hand"):   (1, 5),
    ("uncommon", "head"): (15, 30),
    ("uncommon", "body"): (15, 32),
    ("uncommon", "legs"): (15, 30),
    ("uncommon", "hand"): (6, 14),
    ("rare", "head"):     (40, 70),
    ("rare", "body"):     (40, 65),
    ("rare", "legs"):     (40, 70),
    ("rare", "hand"):     (18, 30),
    ("epic", "head"):     (85, 140),
    ("epic", "body"):     (90, 150),
    ("epic", "legs"):     (85, 130),
    ("epic", "hand"):     (40, 70),
    ("legendary", "head"):(200, 280),
    ("legendary", "body"):(250, 350),
    ("legendary", "legs"):(180, 250),
    ("legendary", "hand"):(60, 150),
}

def _apply_balance():
    from collections import defaultdict
    def _cat(slot):
        if slot in ("head", "body", "legs"): return slot
        if slot in ("right_hand", "left_hand"): return "hand"
        return None
    groups = defaultdict(list)
    for iid, it in ITEMS.items():
        if iid.startswith(_CASE_PREFIXES): continue
        cat = _cat(it.get("slot"))
        rar = it.get("rarity")
        if not cat or rar not in ("common","uncommon","rare","epic","legendary"): continue
        groups[(rar, cat)].append((iid, it.get("price", 0)))
    for key, lst in groups.items():
        lo, hi = _RANGES.get(key, (1, 1))
        lst.sort(key=lambda x: x[1])
        n = len(lst)
        stat_key = "damage" if key[1] == "hand" else "hp"
        for idx, (iid, _) in enumerate(lst):
            if n == 1:
                val = (lo + hi) // 2
            else:
                val = lo + int((hi - lo) * idx / (n - 1) + 0.5)
            ITEMS[iid][stat_key] = val

_apply_balance()
