# api.py
"""Точка сборки REST API. Роутинг + обёртки для bot.py."""
from aiohttp import web

import api_core
import api_economy
import api_social
import api_gang
import api_pvp
import api_admin
import api_boss
import api_donate

def set_token(t):
    api_core.set_token(t)

def set_bot(b):
    api_core.set_bot(b)

async def migrate_crypto_v1():
    await api_economy.migrate_crypto_v1()

async def _process_territories():
    await api_gang._process_territories()

def setup_routes(app):
    R = app.router

    R.add_post("/api/admin/analytics", api_admin.api_admin_analytics)
    R.add_post("/api/admin/search", api_admin.api_admin_search)
    R.add_post("/api/admin/player_info", api_admin.api_admin_player_info)
    R.add_post("/api/admin/change_balance", api_admin.api_admin_change_balance)
    R.add_post("/api/admin/delete", api_admin.api_admin_delete)
    R.add_post("/api/admin/set_level", api_admin.api_admin_set_level)
    R.add_post("/api/admin/staff/list", api_admin.api_admin_staff_list)
    R.add_post("/api/admin/staff/set", api_admin.api_admin_set_role)
    R.add_post("/api/player/mute", api_admin.api_player_mute)

    R.add_post("/api/promo/apply", api_economy.api_promo_apply)
    R.add_post("/api/admin/promo/list", api_admin.api_admin_promo_list)
    R.add_post("/api/admin/promo/create", api_admin.api_admin_promo_create)
    R.add_post("/api/admin/promo/delete", api_admin.api_admin_promo_delete)

    R.add_post("/api/tg_bonus/claim", api_economy.api_tg_bonus_claim)

    R.add_post("/api/me", api_core.api_me)
    R.add_post("/api/register", api_core.api_register)
    R.add_post("/api/reset", api_core.api_reset)

    R.add_post("/api/shop", api_economy.api_shop)
    R.add_post("/api/inventory", api_economy.api_inventory)
    R.add_post("/api/buy", api_economy.api_buy)
    R.add_post("/api/sell", api_economy.api_sell)
    R.add_post("/api/equip", api_economy.api_equip)
    R.add_post("/api/unequip", api_economy.api_unequip)
    R.add_post("/api/jobs", api_economy.api_jobs)
    R.add_post("/api/set_job", api_economy.api_set_job)
    R.add_post("/api/work", api_economy.api_work)
    R.add_post("/api/businesses", api_economy.api_businesses)
    R.add_post("/api/buy_business", api_economy.api_buy_business)
    R.add_post("/api/upgrade_business", api_economy.api_upgrade_business)
    R.add_post("/api/collect_business", api_economy.api_collect_business)
    R.add_post("/api/casino_play", api_economy.api_casino_play)
    R.add_post("/api/daily", api_economy.api_daily)
    R.add_post("/api/roulette", api_economy.api_roulette)
    R.add_post("/api/crime", api_economy.api_crime)
    R.add_post("/api/credit/take", api_economy.api_credit_take)
    R.add_post("/api/credit/pay", api_economy.api_credit_pay)
    R.add_post("/api/crypto/price", api_economy.api_crypto_price)
    R.add_post("/api/crypto/buy", api_economy.api_crypto_buy)
    R.add_post("/api/crypto/sell", api_economy.api_crypto_sell)
    R.add_post("/api/cases/list", api_economy.api_cases_list)
    R.add_post("/api/cases/open", api_economy.api_cases_open)
    R.add_post("/api/referral/info", api_economy.api_referral_info)
    R.add_post("/api/referral/claim", api_economy.api_referral_claim)
    R.add_post("/api/gang/shop/items", api_economy.api_gang_shop_items)
    R.add_post("/api/gang/shop/buy", api_economy.api_gang_shop_buy)

    R.add_post("/api/casino/blackjack/state", api_economy.api_blackjack_state)
    R.add_post("/api/casino/blackjack/start", api_economy.api_blackjack_start)
    R.add_post("/api/casino/blackjack/hit", api_economy.api_blackjack_hit)
    R.add_post("/api/casino/blackjack/stand", api_economy.api_blackjack_stand)
    R.add_post("/api/casino/blackjack/double", api_economy.api_blackjack_double)
    R.add_post("/api/casino/blackjack/cancel", api_economy.api_blackjack_cancel)

    R.add_post("/api/casino/wheel/play", api_economy.api_wheel_play)

    R.add_post("/api/location", api_social.api_location)
    R.add_post("/api/move", api_social.api_move)
    R.add_post("/api/player_view", api_social.api_player_view)
    R.add_post("/api/player_items", api_social.api_player_items)
    R.add_post("/api/trade/send", api_social.api_trade_send)
    R.add_post("/api/trade/details", api_social.api_trade_details)
    R.add_post("/api/trade/list", api_social.api_trades_list)
    R.add_post("/api/trade/accept", api_social.api_trade_accept)
    R.add_post("/api/trade/decline", api_social.api_trade_decline)
    R.add_post("/api/leaderboard", api_social.api_leaderboard)
    R.add_post("/api/friend/search", api_social.api_friend_search)
    R.add_post("/api/friend/request", api_social.api_friend_request)
    R.add_post("/api/friend/respond", api_social.api_friend_respond)
    R.add_post("/api/friend/remove", api_social.api_friend_remove)
    R.add_post("/api/friend/list", api_social.api_friend_list)
    R.add_post("/api/chat/send", api_social.api_chat_send)
    R.add_post("/api/chat/get", api_social.api_chat_get)
    R.add_post("/api/chat/pm/send", api_social.api_chat_pm_send)
    R.add_post("/api/chat/pm/get", api_social.api_chat_pm_get)
    R.add_post("/api/chat/pm/unread_count", api_social.api_chat_pm_unread_count)
    R.add_post("/api/chat/pm/conversations", api_social.api_chat_pm_conversations)
    R.add_post("/api/chat/pm/delete", api_social.api_chat_pm_delete)
    R.add_post("/api/notifications/get", api_social.api_notifications_get)
    R.add_post("/api/notifications/read", api_social.api_notifications_read)
    R.add_post("/api/notifications/delete", api_social.api_notifications_delete)
    R.add_post("/api/online_count", api_social.api_online_count)

    R.add_post("/api/gang/info", api_gang.api_gang_info)
    R.add_post("/api/gang/create", api_gang.api_gang_create)
    R.add_post("/api/gang/join", api_gang.api_gang_join)
    R.add_post("/api/gang/leave", api_gang.api_gang_leave)
    R.add_post("/api/gang/kick", api_gang.api_gang_kick)
    R.add_post("/api/gang/disband", api_gang.api_gang_disband)
    R.add_post("/api/gang/set_tag", api_gang.api_gang_set_tag)
    R.add_post("/api/gang/set_deputy", api_gang.api_gang_set_deputy)
    R.add_post("/api/gang/deposit", api_gang.api_gang_deposit)
    R.add_post("/api/gang/withdraw", api_gang.api_gang_withdraw)
    R.add_post("/api/gang/invite", api_gang.api_gang_invite)
    R.add_post("/api/gang/invite/accept", api_gang.api_gang_invite_accept)
    R.add_post("/api/gang/invite/decline", api_gang.api_gang_invite_decline)
    R.add_post("/api/gang/get", api_gang.api_gang_get)
    R.add_post("/api/gang/territories", api_gang.api_gang_territories)
    R.add_post("/api/gang/capture", api_gang.api_gang_capture)
    R.add_post("/api/gang/captures", api_gang.api_gang_captures)
    R.add_post("/api/territory/capture/start", api_gang.api_territory_capture_start)
    R.add_post("/api/territory/capture/resolve", api_gang.api_territory_capture_resolve)

    R.add_post("/api/pvp/start", api_pvp.api_pvp_start)
    R.add_post("/api/pvp/challenge", api_pvp.api_pvp_challenge)
    R.add_post("/api/pvp/incoming", api_pvp.api_pvp_incoming)
    R.add_post("/api/pvp/respond", api_pvp.api_pvp_respond)
    R.add_post("/api/pvp/state", api_pvp.api_pvp_state)
    R.add_post("/api/pvp/action", api_pvp.api_pvp_action)
    R.add_post("/api/pvp/force_cancel", api_pvp.api_pvp_force_cancel)

    R.add_post("/api/boss/get", api_boss.api_boss_get)
    R.add_post("/api/boss/attack", api_boss.api_boss_attack)

    # ═══ ДОНАТ ═══
    R.add_post("/api/donate/packages", api_donate.api_donate_packages)
    R.add_post("/api/donate/create_invoice", api_donate.api_donate_create_invoice)